import KpiCard from "@/components/admin/KpiCard";
import StatusPill from "@/components/admin/StatusPill";
import { adminGetLatestActivity, adminGetOverviewStats } from "@/lib/admin/overview";

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

type ActivityRun = {
  id: string;
  verdict: string | null;
  created_at: string;
};

type ActivityUser = {
  id: string;
  email: string | null;
  created_at: string;
};

type ActivityAudit = {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  created_at: string;
};

export default async function AdminOverviewPage() {
  const [stats, activity] = await Promise.all([
    adminGetOverviewStats(),
    adminGetLatestActivity()
  ]);
  const runs: ActivityRun[] = Array.isArray(activity.runs) ? (activity.runs as ActivityRun[]) : [];
  const users: ActivityUser[] = Array.isArray(activity.users) ? (activity.users as ActivityUser[]) : [];
  const audits: ActivityAudit[] = Array.isArray(activity.audits) ? (activity.audits as ActivityAudit[]) : [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Overview</p>
        <h1 className="mt-3 text-4xl font-semibold text-[#1f1d18]">Super Admin</h1>
        <p className="mt-2 text-sm text-[#4f4a40]">
          System-level metrics across users, runs, and platform activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Total users" value={stats.total_users} />
        <KpiCard label="New users (7d)" value={stats.new_users_7d} />
        <KpiCard label="New users (30d)" value={stats.new_users_30d} />
        <KpiCard label="Total runs" value={stats.total_runs} />
        <KpiCard label="Runs (7d)" value={stats.runs_7d} />
        <KpiCard label="Runs (30d)" value={stats.runs_30d} />
        <KpiCard label="Error rate" value={formatPercent(stats.error_rate)} hint="Timeouts + failures" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Verdicts</p>
          <div className="mt-4 space-y-2 text-sm text-[#4f4a40]">
            {Object.entries(stats.verdict_distribution).map(([verdict, count]) => (
              <div key={verdict} className="flex items-center justify-between">
                <span>{verdict}</span>
                <span className="text-[#1f1d18]">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Avg. confidence</p>
          <div className="mt-4 space-y-2 text-sm text-[#4f4a40]">
            {Object.entries(stats.avg_confidence_by_verdict).map(([verdict, avg]) => {
              const value = typeof avg === "number" && Number.isFinite(avg) ? avg : 0;
              return (
                <div key={verdict} className="flex items-center justify-between">
                  <span>{verdict}</span>
                  <span className="text-[#1f1d18]">{value.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Latest runs</p>
          <ul className="mt-4 space-y-3 text-sm text-[#4f4a40]">
            {runs.map((run) => (
              <li key={run.id} className="flex items-center justify-between">
                <span>{new Date(run.created_at).toLocaleString()}</span>
                <StatusPill
                  tone={run.verdict === "Likely Human" ? "success" : run.verdict === "Likely AI" ? "danger" : "warning"}
                  label={run.verdict ?? "Unknown"}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Latest signups</p>
          <ul className="mt-4 space-y-3 text-sm text-[#4f4a40]">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between">
                <span className="truncate">{user.email ?? user.id}</span>
                <span className="text-xs text-[#6a6459]">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Admin actions</p>
          <ul className="mt-4 space-y-3 text-sm text-[#4f4a40]">
            {audits.map((audit) => (
              <li key={audit.id} className="space-y-1">
                <p className="text-[#1f1d18]">{audit.action}</p>
                <p className="text-xs text-[#6a6459]">
                  {audit.target_type} {audit.target_id ?? ""} · {new Date(audit.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
