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
      <div className="rounded-3xl border border-[#d8d6cf] bg-white/85 p-6 text-sm text-[#4c4b45]">
        No runs yet. Run a check to populate your history.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        {runs.map((run) => {
          const isSelected = run.id === selectedId;
          return (
            <button
              key={run.id}
              type="button"
              onClick={() => setSelectedId(run.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                isSelected
                  ? "border-[#2f3e4e] bg-[#edf2f5]"
                  : "border-[#d8d6cf] bg-white/85 hover:border-[#c4c1b8]"
              }`}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#7a7670]">
                <span>{formatDateTimeUTC(run.created_at)}</span>
                <span>{Math.round(run.result_score * 100)}%</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#1f1f1c]">
                {formatLabel(run.result_label)}
              </p>
              <p className="mt-2 text-sm text-[#7a7670]">
                {run.input_text.slice(0, 80)}
                {run.input_text.length > 80 ? "..." : ""}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-[#d8d6cf] bg-white/85 p-6">
        {selectedRun ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                Details
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#1f1f1c]">
                {formatLabel(selectedRun.result_label)}
              </p>
              <p className="mt-1 text-sm text-[#7a7670]">
                {Math.round(selectedRun.result_score * 100)}% confidence
              </p>
            </div>

            <div className="text-sm text-[#4c4b45]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                Input
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#1f1f1c]">
                {selectedRun.input_text}
              </p>
            </div>

            <div className="grid gap-3 text-sm text-[#4c4b45]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  Explanation
                </p>
                <p className="mt-2 text-sm text-[#1f1f1c]">
                  {selectedRun.explanation || "No explanation provided."}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  Metadata
                </p>
                <p className="mt-2 text-sm text-[#1f1f1c]">
                  Provider: {selectedRun.provider ?? "Unknown"}
                </p>
                {selectedRun.model && (
                  <p className="text-sm text-[#1f1f1c]">
                    Model: {selectedRun.model}
                  </p>
                )}
                <p className="mt-1 text-xs text-[#7a7670]">
                  {formatDateTimeUTC(selectedRun.created_at)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleDelete(selectedRun.id)}
                className="rounded-full border border-[#d6b8ae] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6a4033] transition hover:border-[#c7a297] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={deletingId === selectedRun.id}
              >
                {deletingId === selectedRun.id ? "Deleting..." : "Delete"}
              </button>
              {error && (
                <span className="text-xs text-[#6a4033]">{error}</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#7a7670]">Select a run to view details.</p>
        )}
      </div>
    </div>
  );
}
