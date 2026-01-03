import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown()
});

export async function adminGetSettings() {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.from("app_settings").select("key, value");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function adminUpdateSetting(key: string, value: unknown, actorId: string) {
  const parsed = settingSchema.parse({ key, value });
  const admin = getSupabaseAdminClient();

  const { data: before } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", parsed.key)
    .single();

  const { error } = await admin
    .from("app_settings")
    .upsert({ key: parsed.key, value: parsed.value, updated_by: actorId })
    .eq("key", parsed.key);

  if (error) {
    throw new Error(error.message);
  }

  return { before };
}
