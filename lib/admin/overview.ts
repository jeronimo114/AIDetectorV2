import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type OverviewStats = {
  total_users: number;
  new_users_7d: number;
  new_users_30d: number;
  total_runs: number;
  runs_7d: number;
  runs_30d: number;
  error_rate: number;
  verdict_distribution: Record<string, number>;
  avg_confidence_by_verdict: Record<string, number>;
};

export async function adminGetOverviewStats() {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.rpc("admin_overview_stats");

  if (error) {
    throw new Error(error.message);
  }

  return data as OverviewStats;
}

export async function adminGetLatestActivity() {
  const admin = getSupabaseAdminClient();

  const [runsRes, auditRes, usersRes] = await Promise.all([
    admin
      .from("analysis_runs")
      .select("id, user_id, verdict, confidence, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    admin
      .from("admin_audit_log")
      .select("id, actor_id, action, target_type, target_id, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    admin.auth.admin.listUsers({ page: 1, perPage: 6 })
  ]);

  return {
    runs: runsRes.data ?? [],
    audits: auditRes.data ?? [],
    users: usersRes.data.users ?? []
  };
}
