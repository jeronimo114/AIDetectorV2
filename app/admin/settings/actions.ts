"use server";

import { requireSuperAdmin } from "@/lib/auth/requireRole";
import { adminUpdateSetting } from "@/lib/admin/settings";
import { logAdminAction } from "@/lib/admin/audit";

export async function updateSetting(key: string, value: unknown) {
  const viewer = await requireSuperAdmin();
  const { before } = await adminUpdateSetting(key, value, viewer.userId);

  await logAdminAction({
    actorId: viewer.userId,
    action: "settings.update",
    targetType: "setting",
    targetId: key,
    before,
    after: { value }
  });
}
