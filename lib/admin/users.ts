import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const listSchema = z.object({
  page: z.number().min(1),
  perPage: z.number().min(1).max(50),
  q: z.string().optional(),
  role: z.enum(["user", "admin", "super_admin"]).optional(),
  status: z.enum(["active", "suspended"]).optional()
});

export async function adminListUsers(params: z.infer<typeof listSchema>) {
  const { page, perPage, q, role, status } = listSchema.parse(params);
  const admin = getSupabaseAdminClient();

  const { data } = await admin.auth.admin.listUsers({ page, perPage });
  let users = data.users;

  if (q) {
    users = users.filter((user) => user.email?.toLowerCase().includes(q.toLowerCase()));
  }

  const userIds = users.map((user) => user.id);

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, role, status")
    .in("id", userIds);

  const { data: counts } = await admin.rpc("admin_run_counts", { user_ids: userIds });

  const profileRows = Array.isArray(profiles) ? profiles : [];
  const countRows = Array.isArray(counts) ? (counts as { user_id: string; run_count: number }[]) : [];
  const profileMap = new Map(profileRows.map((profile) => [profile.id, profile]));
  const countMap = new Map(countRows.map((row) => [row.user_id, row.run_count]));

  const enriched = users.map((user) => {
    const profile = profileMap.get(user.id);
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      role: profile?.role ?? "user",
      status: profile?.status ?? "active",
      runs_count: countMap.get(user.id) ?? 0
    };
  });

  const filtered = enriched.filter((user) => {
    if (role && user.role !== role) {
      return false;
    }
    if (status && user.status !== status) {
      return false;
    }
    return true;
  });

  return {
    users: filtered,
    total: filtered.length
  };
}

export async function adminGetUser(id: string) {
  const admin = getSupabaseAdminClient();
  const { data: user } = await admin.auth.admin.getUserById(id);

  if (!user.user) {
    return null;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, status, admin_notes")
    .eq("id", id)
    .single();

  const { data: runs } = await admin
    .from("analysis_runs")
    .select("id, verdict, confidence, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    id: user.user.id,
    email: user.user.email,
    created_at: user.user.created_at,
    last_sign_in_at: user.user.last_sign_in_at,
    role: profile?.role ?? "user",
    status: profile?.status ?? "active",
    admin_notes: profile?.admin_notes ?? "",
    runs: runs ?? []
  };
}
