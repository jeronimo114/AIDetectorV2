"use client";

import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDateTimeUTC } from "@/lib/format";

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

type HistoryListProps = {
  initialRuns: DetectorRun[];
};

const formatLabel = (label: string) =>
  label
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getLabelStyles = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes("human")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (lower.includes("ai")) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
};

export default function HistoryList({ initialRuns }: HistoryListProps) {
  const [runs, setRuns] = useState(initialRuns);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialRuns[0]?.id ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    setRuns(initialRuns);
    setSelectedId(initialRuns[0]?.id ?? null);
  }, [initialRuns]);

  const selectedRun = useMemo(() => {
    if (!selectedId) {
      return null;
    }

    return runs.find((run) => run.id === selectedId) ?? null;
  }, [runs, selectedId]);

  const handleDelete = async (id: string) => {
    setError(null);
    setDeletingId(id);

    const { error: deleteError } = await supabase
      .from("detector_runs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    const updatedRuns = runs.filter((run) => run.id !== id);
    setRuns(updatedRuns);
    setDeletingId(null);

    if (selectedId === id) {
      setSelectedId(updatedRuns[0]?.id ?? null);
    }
  };

  if (runs.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-gray-400">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-4 font-medium text-gray-900">No runs yet</p>
        <p className="mt-1 text-sm text-gray-500">Run a check to populate your history.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-3">
        {runs.map((run) => {
          const isSelected = run.id === selectedId;
          return (
            <button
              key={run.id}
              type="button"
              onClick={() => setSelectedId(run.id)}
              className={`w-full rounded-xl border px-4 py-4 text-left transition-all ${
                isSelected
                  ? "border-orange-300 bg-orange-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDateTimeUTC(run.created_at)}</span>
                <span className={`rounded-full border px-2 py-0.5 font-medium ${getLabelStyles(run.result_label)}`}>
                  {Math.round(run.result_score * 100)}%
                </span>
              </div>
              <p className="mt-2 font-semibold text-gray-900">
                {formatLabel(run.result_label)}
              </p>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {run.input_text.slice(0, 100)}
                {run.input_text.length > 100 ? "..." : ""}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {selectedRun ? (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Details
              </p>
              <div className="mt-3 flex items-center gap-3">
                <p className="text-2xl font-bold text-gray-900">
                  {formatLabel(selectedRun.result_label)}
                </p>
                <span className={`rounded-full border px-3 py-1 text-sm font-medium ${getLabelStyles(selectedRun.result_label)}`}>
                  {Math.round(selectedRun.result_score * 100)}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Input Text
              </p>
              <p className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                {selectedRun.input_text}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Explanation
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  {selectedRun.explanation || "No explanation provided."}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Metadata
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Provider: {selectedRun.provider ?? "Unknown"}
                </p>
                {selectedRun.model && (
                  <p className="text-sm text-gray-700">
                    Model: {selectedRun.model}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formatDateTimeUTC(selectedRun.created_at)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => handleDelete(selectedRun.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={deletingId === selectedRun.id}
              >
                {deletingId === selectedRun.id ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                      <path d="M8 4h4M4 6h12M17 6l-.867 10.142A2 2 0 0114.136 18H5.864a2 2 0 01-1.997-1.858L3 6m4 4v6m4-6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
              {error && (
                <span className="text-sm text-red-600">{error}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center py-12">
            <p className="text-sm text-gray-500">Select a run to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
