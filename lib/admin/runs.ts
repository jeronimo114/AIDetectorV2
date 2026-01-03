import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const filterSchema = z.object({
  page: z.number().min(1),
  perPage: z.number().min(1).max(50),
  verdict: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional()
});

export async function adminListRuns(filters: z.infer<typeof filterSchema>) {
  const { page, perPage, verdict, status, q, from, to } = filterSchema.parse(filters);
  const admin = getSupabaseAdminClient();

  let query = admin
    .from("analysis_runs")
    .select("id, user_id, verdict, confidence, webhook_status, created_at, error_message")
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

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

  if (q) {
    if (q.includes("@")) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id")
        .ilike("email", `%${q}%`);
      const ids = profiles?.map((profile) => profile.id) ?? [];
      if (ids.length > 0) {
        query = query.in("user_id", ids);
      }
    } else {
      query = query.or(`id.ilike.%${q}%,user_id.ilike.%${q}%`);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function adminGetRun(id: string) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("analysis_runs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
