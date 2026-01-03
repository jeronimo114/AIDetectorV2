"use client";

import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
      <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 text-sm text-[#6a6459]">
        No runs yet. Analyze a sample to populate your history.
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
                  ? "border-[#1f2a1f] bg-[#f6f3ea]"
                  : "border-[#d6d2c6] bg-white/70 hover:border-[#bdb7aa]"
              }`}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#7b756a]">
                <span>{new Date(run.created_at).toLocaleString()}</span>
                <span>{Math.round(run.result_score * 100)}%</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#1f1d18]">
                {formatLabel(run.result_label)}
              </p>
              <p className="mt-2 text-sm text-[#6a6459]">
                {run.input_text.slice(0, 80)}
                {run.input_text.length > 80 ? "..." : ""}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6">
        {selectedRun ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                Details
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#1f1d18]">
                {formatLabel(selectedRun.result_label)}
              </p>
              <p className="mt-1 text-sm text-[#6a6459]">
                {Math.round(selectedRun.result_score * 100)}% confidence
              </p>
            </div>

            <div className="text-sm text-[#4f4a40]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                Input
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#1f1d18]">
                {selectedRun.input_text}
              </p>
            </div>

            <div className="grid gap-3 text-sm text-[#4f4a40]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                  Explanation
                </p>
                <p className="mt-2 text-sm text-[#1f1d18]">
                  {selectedRun.explanation || "No explanation provided."}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                  Metadata
                </p>
                <p className="mt-2 text-sm text-[#1f1d18]">
                  Provider: {selectedRun.provider ?? "Unknown"}
                </p>
                {selectedRun.model && (
                  <p className="text-sm text-[#1f1d18]">
                    Model: {selectedRun.model}
                  </p>
                )}
                <p className="mt-1 text-xs text-[#6a6459]">
                  {new Date(selectedRun.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleDelete(selectedRun.id)}
                className="rounded-full border border-[#d1a9a1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#712d21] transition hover:border-[#b98075] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={deletingId === selectedRun.id}
              >
                {deletingId === selectedRun.id ? "Deleting..." : "Delete"}
              </button>
              {error && (
                <span className="text-xs text-[#8d3b2f]">{error}</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#6a6459]">Select a run to view details.</p>
        )}
      </div>
    </div>
  );
}
