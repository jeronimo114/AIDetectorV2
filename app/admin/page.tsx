import Link from "next/link";
import KpiCard from "@/components/admin/KpiCard";
import StatusPill from "@/components/admin/StatusPill";
import { adminGetLatestActivity, adminGetOverviewStats } from "@/lib/admin/overview";
import { adminGetPaymentStats, adminGetRecentPayments } from "@/lib/admin/payments";

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

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
  const [stats, activity, paymentStats, recentPayments] = await Promise.all([
    adminGetOverviewStats(),
    adminGetLatestActivity(),
    adminGetPaymentStats(),
    adminGetRecentPayments(5)
  ]);

  const runs: ActivityRun[] = Array.isArray(activity.runs) ? (activity.runs as ActivityRun[]) : [];
  const users: ActivityUser[] = Array.isArray(activity.users) ? (activity.users as ActivityUser[]) : [];
  const audits: ActivityAudit[] = Array.isArray(activity.audits) ? (activity.audits as ActivityAudit[]) : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-sm font-medium text-orange-700">Overview</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          System-level metrics across users, runs, and platform activity.
        </p>
      </div>

      {/* Financial Highlights */}
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Financial Overview</h2>
            <p className="text-sm text-gray-600">Revenue and subscription metrics</p>
          </div>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
          >
            View Details
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">MRR</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(paymentStats.mrr)}</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue (30d)</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(paymentStats.revenue_30d)}</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Subs</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{paymentStats.active_subscriptions}</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{formatPercent(paymentStats.success_rate)}</p>
          </div>
        </div>
      </div>

      {/* User & Run Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Total Users"
          value={stats.total_users}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
        />
        <KpiCard
          label="New Users (7d)"
          value={stats.new_users_7d}
          hint={`${stats.new_users_30d} in last 30 days`}
        />
        <KpiCard
          label="Total Runs"
          value={stats.total_runs}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
        />
        <KpiCard label="Runs (7d)" value={stats.runs_7d} />
        <KpiCard label="Runs (30d)" value={stats.runs_30d} />
        <KpiCard label="Error Rate" value={formatPercent(stats.error_rate)} hint="Timeouts + failures" />
      </div>

      {/* Verdict & Confidence Stats */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Verdict Distribution</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.verdict_distribution).map(([verdict, count]) => {
              const total = Object.values(stats.verdict_distribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={verdict}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{verdict}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${
                        verdict === "Likely Human" ? "bg-green-500" :
                        verdict === "Likely AI" ? "bg-red-500" : "bg-yellow-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Confidence by Verdict</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.avg_confidence_by_verdict).map(([verdict, avg]) => {
              const value = typeof avg === "number" && Number.isFinite(avg) ? avg : 0;
              return (
                <div key={verdict} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{verdict}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{value.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Feeds */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Latest Runs */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Runs</h3>
            <Link href="/admin/runs" className="text-xs text-orange-600 hover:text-orange-700 font-medium">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {runs.map((run) => (
              <li key={run.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(run.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
                <StatusPill
                  tone={run.verdict === "Likely Human" ? "success" : run.verdict === "Likely AI" ? "danger" : "warning"}
                  label={run.verdict ?? "Unknown"}
                />
              </li>
            ))}
            {runs.length === 0 && (
              <li className="text-sm text-gray-500">No runs yet</li>
            )}
          </ul>
        </div>

        {/* Latest Signups */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Signups</h3>
            <Link href="/admin/users" className="text-xs text-orange-600 hover:text-orange-700 font-medium">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-700 truncate">{user.email ?? user.id.slice(0, 8)}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </li>
            ))}
            {users.length === 0 && (
              <li className="text-sm text-gray-500">No users yet</li>
            )}
          </ul>
        </div>

        {/* Recent Payments */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Payments</h3>
            <Link href="/admin/payments" className="text-xs text-orange-600 hover:text-orange-700 font-medium">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentPayments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 truncate">{payment.user_email || payment.user_id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(payment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount_cents / 100)}
                  </span>
                  <StatusPill
                    tone={payment.status === "APPROVED" ? "success" : payment.status === "PENDING" ? "warning" : "danger"}
                    label={payment.status}
                  />
                </div>
              </li>
            ))}
            {recentPayments.length === 0 && (
              <li className="text-sm text-gray-500">No payments yet</li>
            )}
          </ul>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Admin Actions</h3>
          <Link href="/admin/audit" className="text-xs text-orange-600 hover:text-orange-700 font-medium">
            View all
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {audits.map((audit) => (
            <li key={audit.id} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-600">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{audit.action}</p>
                <p className="text-xs text-gray-500">
                  {audit.target_type} {audit.target_id ?? ""} · {new Date(audit.created_at).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
          {audits.length === 0 && (
            <li className="text-sm text-gray-500">No admin actions yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}
