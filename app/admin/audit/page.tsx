import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  created_at: string;
};

export default async function AdminAuditPage() {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("admin_audit_log")
    .select("id, actor_id, action, target_type, target_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const audit: AuditRow[] = Array.isArray(data) ? (data as AuditRow[]) : [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Audit</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#1f1d18]">Admin log</h1>
      </header>

      <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-4 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-[#7b756a]">
            <tr>
              <th className="py-3">Action</th>
              <th className="py-3">Target</th>
              <th className="py-3">Actor</th>
              <th className="py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((row: AuditRow) => (
              <tr key={row.id} className="border-t border-[#eee9db]">
                <td className="py-3 text-[#1f1d18]">{row.action}</td>
                <td className="py-3 text-[#4f4a40]">
                  {row.target_type} {row.target_id ?? ""}
                </td>
                <td className="py-3 text-[#4f4a40]">{row.actor_id}</td>
                <td className="py-3 text-[#4f4a40]">
                  {new Date(row.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
