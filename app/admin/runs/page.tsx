import Link from "next/link";

import FilterBar from "@/components/admin/FilterBar";
import StatusPill from "@/components/admin/StatusPill";
import { adminListRuns } from "@/lib/admin/runs";

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default async function AdminRunsPage({
  searchParams
}: {
  searchParams: { page?: string; verdict?: string; status?: string; q?: string; from?: string; to?: string };
}) {
  const page = toNumber(searchParams.page, 1);
  const verdict = searchParams.verdict;
  const status = searchParams.status;
  const q = searchParams.q;
  const from = searchParams.from;
  const to = searchParams.to;

  const runs = await adminListRuns({ page, perPage: 25, verdict, status, q, from, to });

  const params = new URLSearchParams();
  if (verdict) params.set("verdict", verdict);
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const prevPage = page > 1 ? page - 1 : 1;
  const nextPage = page + 1;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Runs</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#1f1d18]">Analysis runs</h1>
      </header>

      <FilterBar>
        <form className="flex flex-wrap items-center gap-3">
          <input
            name="q"
            placeholder="Run id or user id"
            defaultValue={q}
            className="rounded-full border border-[#d6d2c6] bg-white px-4 py-2 text-sm"
          />
          <select
            name="verdict"
            defaultValue={verdict ?? ""}
            className="rounded-full border border-[#d6d2c6] bg-white px-4 py-2 text-sm"
          >
            <option value="">All verdicts</option>
            <option value="Likely AI">Likely AI</option>
            <option value="Unclear">Unclear</option>
            <option value="Likely Human">Likely Human</option>
          </select>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-full border border-[#d6d2c6] bg-white px-4 py-2 text-sm"
          >
            <option value="">All status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="timeout">Timeout</option>
          </select>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-full border border-[#d6d2c6] bg-white px-4 py-2 text-sm"
          />
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-full border border-[#d6d2c6] bg-white px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-full bg-[#1f2a1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6f5ef]"
          >
            Filter
          </button>
        </form>
        <Link
          href={`/admin/reports/export?verdict=${verdict ?? ""}&status=${status ?? ""}&from=${from ?? ""}&to=${to ?? ""}`}
          className="rounded-full border border-[#b9b4a6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f4a40]"
        >
          Export CSV
        </Link>
      </FilterBar>

      <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-4 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-[#7b756a]">
            <tr>
              <th className="py-3">Run</th>
              <th className="py-3">Verdict</th>
              <th className="py-3">Confidence</th>
              <th className="py-3">Status</th>
              <th className="py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-t border-[#eee9db]">
                <td className="py-3">
                  <Link href={`/admin/runs/${run.id}`} className="font-semibold text-[#1f1d18]">
                    {run.id}
                  </Link>
                </td>
                <td className="py-3 text-[#4f4a40]">{run.verdict ?? "Unknown"}</td>
                <td className="py-3 text-[#4f4a40]">{run.confidence ? `${run.confidence}%` : "-"}</td>
                <td className="py-3">
                  <StatusPill
                    tone={run.webhook_status === "success" ? "success" : run.webhook_status === "timeout" ? "warning" : "danger"}
                    label={run.webhook_status}
                  />
                </td>
                <td className="py-3 text-[#4f4a40]">{new Date(run.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-center justify-between text-sm text-[#6a6459]">
          <Link href={`/admin/runs?${new URLSearchParams({ ...Object.fromEntries(params), page: String(prevPage) })}`}>
            Previous
          </Link>
          <span>Page {page}</span>
          <Link href={`/admin/runs?${new URLSearchParams({ ...Object.fromEntries(params), page: String(nextPage) })}`}>
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
