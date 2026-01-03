import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type ImpersonationSession = {
  id: string;
  target_user_id: string;
  expires_at: string;
  used_at: string | null;
};

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

  if (!profile || profile.role !== "super_admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/users", request.url));
  }

  const admin = getSupabaseAdminClient();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const { data } = await admin
    .from("impersonation_sessions")
    .select("id, target_user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .single();

  const session = data as ImpersonationSession | null;

  if (!session || session.used_at || new Date(session.expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/admin/users", request.url));
  }

  const { data: targetData } = await admin
    .from("profiles")
    .select("email")
    .eq("id", session.target_user_id)
    .single();
  const target = (targetData as { email: string | null } | null) ?? null;

  await admin
    .from("impersonation_sessions")
    .update({ used_at: new Date().toISOString() })
    .eq("id", session.id);

  const response = NextResponse.redirect(new URL("/admin/users", request.url));
  response.cookies.set({
    name: "impersonate_user_id",
    value: session.target_user_id,
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
  response.cookies.set({
    name: "impersonate_user_email",
    value: target?.email ?? "",
    httpOnly: false,
    sameSite: "lax",
    path: "/"
  });

  return response;
}
