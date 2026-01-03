import Link from "next/link";

import FilterBar from "@/components/admin/FilterBar";
import StatusPill from "@/components/admin/StatusPill";
import { adminListUsers } from "@/lib/admin/users";

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: { page?: string; q?: string; role?: string; status?: string };
}) {
  const page = toNumber(searchParams.page, 1);
  const q = searchParams.q ?? "";
  const role = searchParams.role as "user" | "admin" | "super_admin" | undefined;
  const status = searchParams.status as "active" | "suspended" | undefined;

  const { users } = await adminListUsers({ page, perPage: 25, q, role, status });

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (role) params.set("role", role);
  if (status) params.set("status", status);

  const prevPage = page > 1 ? page - 1 : 1;
  const nextPage = page + 1;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Users</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#1f1d18]">User management</h1>
      </header>

      <FilterBar>
        <form className="flex flex-wrap items-center gap-3">
          <input
            name="q"
            placeholder="Search email"
            defaultValue={q}
            className="rounded-full border border-[#d6d2c6] bg-white px-4 py-2 text-sm"
          />
          <select
            name="role"
            defaultValue={role ?? ""}
            className="rounded-full border border-[#d6d2c6] bg-white px-4 py-2 text-sm"
          >
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-full border border-[#d6d2c6] bg-white px-4 py-2 text-sm"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-[#1f2a1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6f5ef]"
          >
            Filter
          </button>
        </form>
      </FilterBar>

      <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-4 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-[#7b756a]">
            <tr>
              <th className="py-3">User</th>
              <th className="py-3">Role</th>
              <th className="py-3">Status</th>
              <th className="py-3">Runs</th>
              <th className="py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[#eee9db]">
                <td className="py-3">
                  <Link href={`/admin/users/${user.id}`} className="font-semibold text-[#1f1d18]">
                    {user.email ?? user.id}
                  </Link>
                </td>
                <td className="py-3 text-[#4f4a40]">{user.role}</td>
                <td className="py-3">
                  <StatusPill
                    tone={user.status === "active" ? "success" : "danger"}
                    label={user.status}
                  />
                </td>
                <td className="py-3 text-[#4f4a40]">{user.runs_count}</td>
                <td className="py-3 text-[#4f4a40]">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-center justify-between text-sm text-[#6a6459]">
          <Link href={`/admin/users?${new URLSearchParams({ ...Object.fromEntries(params), page: String(prevPage) })}`}>
            Previous
          </Link>
          <span>Page {page}</span>
          <Link href={`/admin/users?${new URLSearchParams({ ...Object.fromEntries(params), page: String(nextPage) })}`}>
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
