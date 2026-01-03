"use server";

import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { z } from "zod";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth/requireRole";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";

const roleSchema = z.enum(["user", "admin", "super_admin"]);
const statusSchema = z.enum(["active", "suspended"]);

export async function updateUserRole(userId: string, role: string) {
  const viewer = await requireSuperAdmin();
  const nextRole = roleSchema.parse(role);
  const admin = getSupabaseAdminClient();

  const { data: before } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const { error } = await admin
    .from("profiles")
    .update({ role: nextRole })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: viewer.userId,
    action: "user.role.update",
    targetType: "user",
    targetId: userId,
    before,
    after: { role: nextRole }
  });
}

export async function updateUserStatus(userId: string, status: string) {
  const viewer = await requireAdmin();
  const nextStatus = statusSchema.parse(status);
  const admin = getSupabaseAdminClient();

  const { data: before } = await admin
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .single();

  const { error } = await admin
    .from("profiles")
    .update({ status: nextStatus })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: viewer.userId,
    action: "user.status.update",
    targetType: "user",
    targetId: userId,
    before,
    after: { status: nextStatus }
  });
}

export async function updateAdminNotes(userId: string, formData: FormData) {
  const viewer = await requireAdmin();
  const admin = getSupabaseAdminClient();
  const notes = String(formData.get("notes") ?? "");

  const { data: before } = await admin
    .from("profiles")
    .select("admin_notes")
    .eq("id", userId)
    .single();

  const { error } = await admin
    .from("profiles")
    .update({ admin_notes: notes })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: viewer.userId,
    action: "user.notes.update",
    targetType: "user",
    targetId: userId,
    before,
    after: { admin_notes: notes }
  });
}

export async function softDeleteUser(userId: string) {
  const viewer = await requireSuperAdmin();
  const admin = getSupabaseAdminClient();

  const { data: before } = await admin
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .single();

  const { error } = await admin
    .from("profiles")
    .update({ status: "suspended" })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: viewer.userId,
    action: "user.soft_delete",
    targetType: "user",
    targetId: userId,
    before,
    after: { status: "suspended" }
  });
}

export async function hardDeleteUser(userId: string) {
  const viewer = await requireSuperAdmin();
  const admin = getSupabaseAdminClient();

  const { data: before } = await admin.auth.admin.getUserById(userId);
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: viewer.userId,
    action: "user.hard_delete",
    targetType: "user",
    targetId: userId,
    before,
    after: { deleted: true }
  });
}

export async function createImpersonationSession(userId: string) {
  const viewer = await requireSuperAdmin();
  const admin = getSupabaseAdminClient();
  const token = crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await admin.from("impersonation_sessions").insert({
    admin_id: viewer.userId,
    target_user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt
  });

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: viewer.userId,
    action: "impersonation.create",
    targetType: "user",
    targetId: userId
  });

  redirect(`/admin/impersonate?token=${token}`);
}
