"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth/requireRole";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";

const reviewSchema = z.object({
  reviewed: z.boolean(),
  label: z.enum(["false_positive", "false_negative", "unknown"]).optional()
});

export async function markRunReviewed(runId: string, reviewed: boolean, label?: string) {
  const viewer = await requireAdmin();
  const admin = getSupabaseAdminClient();
  const parsed = reviewSchema.parse({ reviewed, label });

  const { data: before } = await admin
    .from("analysis_runs")
    .select("reviewed, review_label")
    .eq("id", runId)
    .single();

  const { error } = await admin
    .from("analysis_runs")
    .update({ reviewed: parsed.reviewed, review_label: parsed.label ?? null })
    .eq("id", runId);

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: viewer.userId,
    action: "run.review.update",
    targetType: "run",
    targetId: runId,
    before,
    after: { reviewed: parsed.reviewed, review_label: parsed.label ?? null }
  });
}

export async function rerunAnalysis(runId: string) {
  const viewer = await requireAdmin();
  const admin = getSupabaseAdminClient();

  const { data } = await admin
    .from("analysis_runs")
    .select("id, user_id, input_text")
    .eq("id", runId)
    .single();

  const run = data as { id: string; user_id: string; input_text: string | null } | null;

  if (!run) {
    throw new Error("Run not found.");
  }

  const { data: settings } = await admin
    .from("app_settings")
    .select("key, value")
    .in("key", ["n8n_webhook_url", "analysis_timeout_seconds", "enable_rerun"]);

  const settingsMap = new Map(settings?.map((row) => [row.key, row.value]) ?? []);
  const rerunEnabled = settingsMap.get("enable_rerun");
  if (rerunEnabled === false) {
    throw new Error("Rerun is disabled by settings.");
  }

  const webhookUrl = settingsMap.get("n8n_webhook_url") || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  const timeoutSeconds = Number(settingsMap.get("analysis_timeout_seconds") ?? 20);

  if (!webhookUrl || typeof webhookUrl !== "string") {
    throw new Error("Missing webhook URL.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

  let responseData: Record<string, unknown> | null = null;
  let status: "success" | "error" | "timeout" = "success";
  let errorMessage: string | null = null;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: run.input_text,
        meta: {
          source: "ai-detector-admin-rerun",
          timestamp: new Date().toISOString(),
          parent_run_id: run.id
        }
      }),
      signal: controller.signal
    });

    responseData = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      status = "error";
      errorMessage = `Request failed with status ${response.status}.`;
    }
  } catch (error) {
    status = error instanceof DOMException && error.name === "AbortError" ? "timeout" : "error";
    errorMessage = error instanceof Error ? error.message : "Unknown error";
  } finally {
    clearTimeout(timeoutId);
  }

  const verdict = typeof responseData?.verdict === "string" ? responseData.verdict : null;
  const confidence = typeof responseData?.confidence === "number"
    ? Math.round(responseData.confidence * 10000) / 100
    : null;
  const inputText = typeof run.input_text === "string" ? run.input_text : null;
  const charCount = typeof inputText === "string" ? inputText.length : null;

  const { error } = await admin.from("analysis_runs").insert({
    user_id: run.user_id,
    input_text: inputText,
    char_count: charCount,
    verdict,
    confidence,
    breakdown: responseData?.breakdown ?? null,
    signals: responseData?.signals ?? null,
    model: typeof responseData?.model === "string" ? responseData.model : null,
    webhook_status: status,
    error_message: errorMessage,
    raw_response: responseData,
    parent_run_id: run.id
  });

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: viewer.userId,
    action: "run.rerun",
    targetType: "run",
    targetId: run.id,
    after: { status }
  });
}
