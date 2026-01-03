import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestMeta } from "@/lib/auth/requireRole";

export async function logAdminAction(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
}) {
  const admin = getSupabaseAdminClient();
  const meta = getRequestMeta();

  await admin.from("admin_audit_log").insert({
    actor_id: params.actorId,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId ?? null,
    before: params.before ?? null,
    after: params.after ?? null,
    meta
  });
}
