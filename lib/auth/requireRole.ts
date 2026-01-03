import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Profile = {
  id: string;
  email: string | null;
  role: "user" | "admin" | "super_admin";
  status: "active" | "suspended";
};

type ViewerContext = {
  userId: string;
  email: string | null;
  role: Profile["role"];
  status: Profile["status"];
  impersonating: null | {
    userId: string;
    email: string | null;
  };
};

export async function requireAdmin(): Promise<ViewerContext> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, status")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    redirect("/");
  }

  const cookieStore = cookies();
  const impersonateUserId = cookieStore.get("impersonate_user_id")?.value ?? null;
  const impersonateEmail = cookieStore.get("impersonate_user_email")?.value ?? null;

  return {
    userId: user.id,
    email: user.email ?? null,
    role: profile.role,
    status: profile.status,
    impersonating: impersonateUserId
      ? { userId: impersonateUserId, email: impersonateEmail }
      : null
  };
}

export async function requireSuperAdmin(): Promise<ViewerContext> {
  const context = await requireAdmin();

  if (context.role !== "super_admin") {
    redirect("/admin");
  }

  return context;
}

export function getRequestMeta() {
  const hdrs = headers();
  return {
    ip: hdrs.get("x-forwarded-for") ?? "",
    ua: hdrs.get("user-agent") ?? ""
  };
}

export async function getImpersonationTarget() {
  const cookieStore = cookies();
  const impersonateUserId = cookieStore.get("impersonate_user_id")?.value ?? null;

  if (!impersonateUserId) {
    return null;
  }

  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, email")
    .eq("id", impersonateUserId)
    .single();

  return data ?? null;
}
