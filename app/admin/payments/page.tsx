import Link from "next/link";
import KpiCard from "@/components/admin/KpiCard";
import StatusPill from "@/components/admin/StatusPill";
import {
  adminGetPaymentStats,
  adminGetPayments,
  adminGetSubscriptions,
  adminGetRevenueChart
} from "@/lib/admin/payments";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getPaymentStatusTone(status: string): "success" | "warning" | "danger" | "neutral" | "info" {
  switch (status) {
    case "APPROVED":
      return "success";
    case "PENDING":
      return "warning";
    case "DECLINED":
    case "ERROR":
      return "danger";
    case "VOIDED":
      return "neutral";
    default:
      return "neutral";
  }
}

function getSubscriptionStatusTone(status: string): "success" | "warning" | "danger" | "neutral" | "info" {
  switch (status) {
    case "active":
      return "success";
    case "past_due":
      return "warning";
    case "cancelled":
    case "expired":
      return "danger";
    default:
      return "neutral";
  }
}

export default async function AdminPaymentsPage() {
  const [stats, paymentsData, subscriptionsData, revenueChart] = await Promise.all([
    adminGetPaymentStats(),
    adminGetPayments({ limit: 10 }),
    adminGetSubscriptions({ limit: 10 }),
    adminGetRevenueChart()
  ]);

  const maxRevenue = Math.max(...revenueChart.map(d => d.revenue), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-sm font-medium text-orange-700">Financial Overview</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Payments & Subscriptions</h1>
        <p className="mt-2 text-gray-600">
          Monitor revenue, payments, and subscription metrics.
        </p>
      </div>

      {/* Revenue KPIs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(stats.total_revenue)}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M4 8a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          }
        />
        <KpiCard
          label="Revenue (30d)"
          value={formatCurrency(stats.revenue_30d)}
          hint={`${stats.payments_30d} payments`}
        />
        <KpiCard
          label="MRR"
          value={formatCurrency(stats.mrr)}
          hint="Monthly Recurring Revenue"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          }
        />
        <KpiCard
          label="Avg. Payment"
          value={formatCurrency(stats.average_payment)}
          hint={`${Math.round(stats.success_rate * 100)}% success rate`}
        />
      </div>

      {/* Subscription & Payment Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active Subscriptions"
          value={stats.active_subscriptions}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
        />
        <KpiCard
          label="Past Due"
          value={stats.past_due_subscriptions}
          hint="Need attention"
        />
        <KpiCard
          label="Cancelled"
          value={stats.cancelled_subscriptions}
        />
        <KpiCard
          label="Total Payments"
          value={stats.total_payments}
          hint={`${stats.failed_payments} failed`}
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Revenue (Last 30 Days)</h2>
            <p className="text-sm text-gray-500">{formatCurrency(stats.revenue_30d)} total</p>
          </div>
        </div>
        <div className="mt-6 flex h-48 items-end gap-1">
          {revenueChart.map((day, index) => (
            <div
              key={day.date}
              className="group relative flex-1"
            >
              <div
                className="w-full rounded-t bg-orange-500 transition-all hover:bg-orange-600"
                style={{
                  height: `${Math.max((day.revenue / maxRevenue) * 100, 2)}%`,
                  minHeight: "4px"
                }}
              />
              <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap z-10">
                {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: {formatCurrency(day.revenue)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>{new Date(revenueChart[0]?.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span>{new Date(revenueChart[revenueChart.length - 1]?.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Plan Distribution</h2>
          <p className="text-sm text-gray-500">Active subscriptions by plan</p>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.plan_distribution).length > 0 ? (
              Object.entries(stats.plan_distribution).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${plan === "pro" ? "bg-orange-500" : "bg-blue-500"}`} />
                    <span className="text-sm font-medium text-gray-900 capitalize">{plan}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{count} users</span>
                    <span className="text-xs text-gray-400">
                      ({Math.round((count / stats.active_subscriptions) * 100)}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No active subscriptions yet</p>
            )}
          </div>
        </div>

        {/* Payment Success Rate */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Payment Performance</h2>
          <p className="text-sm text-gray-500">Success vs failed payments</p>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-gray-900">{Math.round(stats.success_rate * 100)}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${stats.success_rate * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl bg-green-50 p-3">
                <p className="text-2xl font-bold text-green-700">{stats.successful_payments}</p>
                <p className="text-xs text-green-600">Successful</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <p className="text-2xl font-bold text-red-700">{stats.failed_payments}</p>
                <p className="text-xs text-red-600">Failed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="font-semibold text-gray-900">Recent Payments</h2>
            <p className="text-sm text-gray-500">Latest payment transactions</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paymentsData.payments.length > 0 ? (
                paymentsData.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-900">{payment.reference.slice(0, 20)}...</span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/users/${payment.user_id}`}
                        className="text-sm text-orange-600 hover:text-orange-700"
                      >
                        {payment.user_email || payment.user_id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount_cents / 100)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill tone={getPaymentStatusTone(payment.status)} label={payment.status} />
                    </td>
                    <td className="px-6 py-4">
                      {payment.card_brand && payment.card_last_four ? (
                        <span className="text-sm text-gray-600">
                          {payment.card_brand} ····{payment.card_last_four}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(payment.created_at)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Subscriptions Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="font-semibold text-gray-900">Recent Subscriptions</h2>
            <p className="text-sm text-gray-500">Latest subscription activity</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptionsData.subscriptions.length > 0 ? (
                subscriptionsData.subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/users/${subscription.user_id}`}
                        className="text-sm text-orange-600 hover:text-orange-700"
                      >
                        {subscription.customer_email || subscription.user_id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        subscription.plan_id === "pro"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {subscription.plan_id.charAt(0).toUpperCase() + subscription.plan_id.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill tone={getSubscriptionStatusTone(subscription.status)} label={subscription.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(subscription.amount_cents / 100)}/mo
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(subscription.created_at)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
