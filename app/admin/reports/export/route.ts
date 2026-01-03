import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const url = new URL(request.url);
  const verdict = url.searchParams.get("verdict");
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const userId = url.searchParams.get("user_id");

  const admin = getSupabaseAdminClient();
  let query = admin
    .from("analysis_runs")
    .select("id, user_id, verdict, confidence, webhook_status, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (verdict) {
    query = query.eq("verdict", verdict);
  }

  if (status) {
    query = query.eq("webhook_status", status);
  }

  if (from) {
    query = query.gte("created_at", from);
  }

  if (to) {
    query = query.lte("created_at", to);
  }

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows = data ?? [];
  const header = ["id", "user_id", "verdict", "confidence", "webhook_status", "created_at"];
  const csv = [header.join(",")]
    .concat(
      rows.map((row) =>
        [
          row.id,
          row.user_id,
          row.verdict ?? "",
          row.confidence ?? "",
          row.webhook_status ?? "",
          row.created_at
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
    )
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=analysis_runs.csv"
    }
  });
}
