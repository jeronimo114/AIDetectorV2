import Link from "next/link";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingLink from "@/components/LoadingLink";
import StatusPill from "@/components/admin/StatusPill";
import { requireAdmin } from "@/lib/auth/requireRole";
import { adminGetUser } from "@/lib/admin/users";
import {
  createImpersonationSession,
  hardDeleteUser,
  softDeleteUser,
  updateUserPlan,
  updateAdminNotes,
  updateUserRole,
  updateUserStatus
} from "@/app/admin/users/actions";

type UserDetail = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  role: "user" | "admin" | "super_admin";
  status: "active" | "suspended";
  admin_notes: string;
  plan: "free" | "starter" | "pro";
  runs: { id: string; verdict: string | null; confidence: number | null; created_at: string }[];
};

export default async function AdminUserDetailPage({
  params
}: {
  params: { id: string };
}) {
  const viewer = await requireAdmin();
  const user = (await adminGetUser(params.id)) as UserDetail | null;

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#6a6459]">User not found.</p>
        <Link href="/admin/users" className="text-sm text-[#1f1d18]">
          Back to users
        </Link>
      </div>
    );
  }

  const isSuperAdmin = viewer.role === "super_admin";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">User</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#1f1d18]">{user.email}</h1>
        <p className="mt-2 text-sm text-[#4f4a40]">ID: {user.id}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Profile</p>
          <div className="mt-4 space-y-3 text-sm text-[#4f4a40]">
            <p>Created: {new Date(user.created_at).toLocaleString()}</p>
            <p>Last sign in: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}</p>
            <p>
              Role: <span className="text-[#1f1d18]">{user.role}</span>
            </p>
            <p>
              Status: <StatusPill tone={user.status === "active" ? "success" : "danger"} label={user.status} />
            </p>
            <p>
              Plan: <span className="text-[#1f1d18]">{user.plan}</span>
            </p>
          </div>

          <div className="mt-4">
            <form
              action={updateUserPlan.bind(null, user.id)}
              className="flex flex-wrap items-center gap-3"
            >
              <select
                name="plan"
                defaultValue={user.plan}
                className="rounded-full border border-[#b9b4a6] bg-white px-4 py-2 text-xs"
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
              </select>
              <button
                type="submit"
                className="rounded-full bg-[#1f2a1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6f5ef]"
              >
                Update plan
              </button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <form action={updateUserStatus.bind(null, user.id, user.status === "active" ? "suspended" : "active")}>
              <button
                type="submit"
                className="rounded-full border border-[#b9b4a6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f4a40]"
              >
                {user.status === "active" ? "Suspend" : "Unsuspend"}
              </button>
            </form>
            {isSuperAdmin && (
              <form action={updateUserRole.bind(null, user.id, user.role === "admin" ? "user" : "admin")}>
                <button
                  type="submit"
                  className="rounded-full border border-[#b9b4a6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f4a40]"
                >
                  {user.role === "admin" ? "Demote" : "Promote"}
                </button>
              </form>
            )}
            {isSuperAdmin && (
              <form action={createImpersonationSession.bind(null, user.id)}>
                <button
                  type="submit"
                  className="rounded-full bg-[#1f2a1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6f5ef]"
                >
                  Impersonate
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Admin notes</p>
          <form action={updateAdminNotes.bind(null, user.id)} className="mt-4 space-y-3">
            <textarea
              name="notes"
              defaultValue={user.admin_notes}
              className="min-h-[140px] w-full rounded-2xl border border-[#d6d2c6] bg-white/90 p-4 text-sm text-[#1f1d18]"
            />
            <button
              type="submit"
              className="rounded-full bg-[#1f2a1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6f5ef]"
            >
              Save notes
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Recent runs</p>
        <ul className="mt-4 space-y-3 text-sm text-[#4f4a40]">
          {user.runs.map((run) => (
            <li key={run.id} className="flex items-center justify-between">
              <Link href={`/admin/runs/${run.id}`} className="text-[#1f1d18]">
                {run.verdict ?? "Unknown"}
              </Link>
              <span>{new Date(run.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <LoadingLink
          href={`/admin/reports/export?user_id=${user.id}`}
          className="mt-4 inline-flex rounded-full border border-[#b9b4a6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f4a40]"
        >
          Export CSV
        </LoadingLink>
      </div>

      {isSuperAdmin && (
        <div className="flex flex-wrap gap-4">
          <ConfirmDialog label="Soft delete" onConfirm={softDeleteUser.bind(null, user.id)} />
          <ConfirmDialog label="Hard delete" onConfirm={hardDeleteUser.bind(null, user.id)} />
        </div>
      )}
    </div>
  );
}
