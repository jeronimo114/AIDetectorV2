import { redirect } from "next/navigation";

import HistoryList from "@/components/HistoryList";
import LoadingLink from "@/components/LoadingLink";
import { formatDateTimeUTC } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const { data, error: runsError } = await supabase
    .from("detector_runs")
    .select(
      "id, input_text, result_label, result_score, explanation, provider, model, created_at, meta"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const runs = (data ?? []) as DetectorRun[];
  const error = runsError?.message ?? null;
  const runCount = runs.length;
  const lastRunTime = runs[0]?.created_at
    ? formatDateTimeUTC(runs[0].created_at)
    : "No runs yet";
  const rawPlan =
    typeof user.user_metadata?.plan === "string"
      ? user.user_metadata.plan.toLowerCase()
      : "free";
  const plan = rawPlan === "starter" || rawPlan === "pro" ? rawPlan : "free";
  const planTitle = plan === "pro" ? "Pro" : plan === "starter" ? "Starter" : "Free";
  const planBadge =
    plan === "pro" ? "Pro member" : plan === "starter" ? "Starter member" : "Free member";
  const planDescription =
    plan === "pro"
      ? "Higher limits and advanced workflows."
      : plan === "starter"
        ? "Regular revisions and deeper signal guidance."
        : "Occasional checks and basic coverage.";
  const planStyles =
    plan === "pro"
      ? "border-[#b8c7d4] bg-[#e6ecf1] text-[#1f2a36]"
      : plan === "starter"
        ? "border-[#c9d5de] bg-[#edf2f5] text-[#2f3e4e]"
        : "border-[#d8d6cf] bg-[#f3f3ef] text-[#4c4b45]";
  const memberSince = new Date(user.created_at).toLocaleDateString();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#e6ecf1] opacity-60 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-[#edf2f5] opacity-70 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[960px] flex-col px-6 pb-16 pt-12">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            Dashboard
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-[#1f1f1c]">
            Run history
          </h1>
          <p className="mt-3 text-sm text-[#4c4b45]">
            Review your recent Veridict runs and metadata.
          </p>
        </header>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[#d8d6cf] bg-white/85 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  Summary
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#1f1f1c]">
                  {`${runCount} runs`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  Last run
                </p>
                <p className="mt-2 text-sm text-[#1f1f1c]">
                  {lastRunTime}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d8d6cf] bg-white/85 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              Plan
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-semibold text-[#1f1f1c]">
                {planTitle}
              </p>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${planStyles}`}
              >
                {planBadge}
              </span>
            </div>
            <p className="mt-2 text-sm text-[#4c4b45]">{planDescription}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <LoadingLink
                href="/pricing"
                className="rounded-full bg-[#2f3e4e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f7f7f4]"
              >
                Manage plan
              </LoadingLink>
              <span className="text-xs text-[#7a7670]">
                Member since {memberSince}.
              </span>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-[#e2ccc2] bg-[#f0e4de] p-4 text-sm text-[#6a4033]">
            Unable to load run history. {error}
          </div>
        )}

        <section className="mt-8">
          <HistoryList initialRuns={runs} />
        </section>
      </div>
    </main>
  );
}
