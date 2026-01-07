import { redirect } from "next/navigation";

import HistoryList from "@/components/HistoryList";
import LoadingLink from "@/components/LoadingLink";
import SubscriptionManager from "@/components/SubscriptionManager";
import { formatDateTimeUTC } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Subscription, Payment } from "@/lib/wompi/types";

type DetectorRun = {
  id: string;
  input_text: string;
  result_label: string;
  result_score: number;
  explanation: string | null;
  provider: string | null;
  model: string | null;
  created_at: string;
  meta: Record<string, unknown> | null;
};

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Fetch detector runs, subscription, and payments in parallel
  const [runsResult, subscriptionResult, paymentsResult, profileResult] = await Promise.all([
    supabase
      .from("detector_runs")
      .select(
        "id, input_text, result_label, result_score, explanation, provider, model, created_at, meta"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "past_due", "cancelled"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single()
  ]);

  const runs = (runsResult.data ?? []) as DetectorRun[];
  const error = runsResult.error?.message ?? null;
  const subscription = subscriptionResult.data as Subscription | null;
  const payments = (paymentsResult.data ?? []) as Payment[];
  const profilePlan = profileResult.data?.plan || "free";
  const runCount = runs.length;
  const lastRunTime = runs[0]?.created_at
    ? formatDateTimeUTC(runs[0].created_at)
    : "No runs yet";

  // Use profile plan from database
  const plan = profilePlan === "starter" || profilePlan === "pro" ? profilePlan : "free";
  const planTitle = plan === "pro" ? "Pro" : plan === "starter" ? "Starter" : "Free";
  const planBadge =
    plan === "pro" ? "Pro member" : plan === "starter" ? "Starter member" : "Free member";
  const planStyles =
    plan === "pro"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : plan === "starter"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-gray-100 text-gray-600 border-gray-200";
  const memberSince = new Date(user.created_at).toLocaleDateString();

  return (
    <main className="relative min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1000px] flex-col px-6 pb-16 pt-10">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-sm font-medium text-orange-700">Dashboard</span>
          </div>
          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Run History
          </h1>
          <p className="mt-2 text-gray-600">
            Review your recent Veridict runs and metadata.
          </p>
        </header>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Summary
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {runCount} runs
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Last run
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  {lastRunTime}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Plan
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-bold text-gray-900">
                {planTitle}
              </p>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${planStyles}`}
              >
                {planBadge}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-500">
                Member since {memberSince}
              </span>
            </div>
          </div>
        </section>

        {/* Subscription Management */}
        <section className="mt-8">
          <SubscriptionManager
            subscription={subscription}
            payments={payments}
            userPlan={plan}
          />
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load run history. {error}
          </div>
        )}

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Analysis History</h2>
          <HistoryList initialRuns={runs} />
        </section>

        {/* Quick Actions */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <LoadingLink
              href="/detector"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="12" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              New Analysis
            </LoadingLink>
            <LoadingLink
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              View Plans
            </LoadingLink>
          </div>
        </section>
      </div>
    </main>
  );
}
