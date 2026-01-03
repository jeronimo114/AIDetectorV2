import JsonViewer from "@/components/admin/JsonViewer";
import RedactedText from "@/components/admin/RedactedText";
import StatusPill from "@/components/admin/StatusPill";
import { adminGetRun } from "@/lib/admin/runs";
import { markRunReviewed, rerunAnalysis } from "@/app/admin/runs/actions";

export default async function AdminRunDetailPage({
  params
}: {
  params: { id: string };
}) {
  const run = await adminGetRun(params.id);

  async function handleReview(formData: FormData) {
    "use server";
    const reviewed = formData.get("reviewed") === "true";
    const label = formData.get("review_label")?.toString() || undefined;
    await markRunReviewed(run.id, reviewed, label);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Run</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#1f1d18]">{run.id}</h1>
        <p className="mt-2 text-sm text-[#4f4a40]">User: {run.user_id}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Input</p>
          <div className="mt-4">
            <RedactedText text={run.input_text ?? ""} />
          </div>
        </div>

        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Result</p>
          <div className="mt-4 space-y-3 text-sm text-[#4f4a40]">
            <div className="flex items-center justify-between">
              <span>Verdict</span>
              <StatusPill
                tone={run.verdict === "Likely Human" ? "success" : run.verdict === "Likely AI" ? "danger" : "warning"}
                label={run.verdict ?? "Unknown"}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Confidence</span>
              <span className="text-[#1f1d18]">{run.confidence ? `${run.confidence}%` : "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <StatusPill
                tone={run.webhook_status === "success" ? "success" : run.webhook_status === "timeout" ? "warning" : "danger"}
                label={run.webhook_status}
              />
            </div>
            {run.error_message && (
              <p className="text-xs text-[#8d3b2f]">{run.error_message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Breakdown</p>
          <JsonViewer value={run.breakdown ?? []} />
        </div>
        <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Signals</p>
          <JsonViewer value={run.signals ?? []} />
        </div>
      </div>

      <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Raw response</p>
        <JsonViewer value={run.raw_response ?? {}} />
      </div>

      <div className="flex flex-wrap gap-3">
        <form action={handleReview} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="reviewed" value={String(!run.reviewed)} />
          <select
            name="review_label"
            defaultValue={run.review_label ?? "unknown"}
            className="rounded-full border border-[#d6d2c6] bg-white px-4 py-2 text-xs"
          >
            <option value="unknown">Unknown</option>
            <option value="false_positive">False positive</option>
            <option value="false_negative">False negative</option>
          </select>
          <button
            type="submit"
            className="rounded-full border border-[#b9b4a6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f4a40]"
          >
            {run.reviewed ? "Unmark reviewed" : "Mark reviewed"}
          </button>
        </form>
        <form action={rerunAnalysis.bind(null, run.id)}>
          <button
            type="submit"
            className="rounded-full bg-[#1f2a1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6f5ef]"
          >
            Re-run analysis
          </button>
        </form>
      </div>
    </div>
  );
}
