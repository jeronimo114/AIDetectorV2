"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { User } from "@supabase/supabase-js";

import LoadingLink from "@/components/LoadingLink";
import TipRotator from "@/components/TipRotator";
import WhatChangedPanel from "@/components/WhatChangedPanel";
import type { Comparison, Verdict } from "@/lib/analysis/compare";
import { buildComparison } from "@/lib/analysis/compare";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MIN_CHARS = 80;
const MAX_CHARS = 12000;
const FREE_MAX_CHARS = 1500;
const TIMEOUT_MS = 20000;
const FILE_ACCEPT = ".txt,.md,text/plain,text/markdown";
const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? "";

type PreferredResponse = {
  verdict: Verdict;
  confidence: number;
  breakdown: string[];
  signals?: string[];
  model?: string;
};

type ResultState =
  | { type: "preferred"; data: PreferredResponse; receivedAt: string }
  | { type: "raw"; data: unknown; receivedAt: string };

type RunSnapshot = {
  inputText: string;
  receivedAt: string;
  result: ResultState;
  analysisRunId: string | null;
  userId: string | null;
};

type PlanTier = "free" | "starter" | "pro";

type VerdictTone = "positive" | "neutral" | "caution";

const verdictToneMap: Record<Verdict, VerdictTone> = {
  "Likely AI": "caution",
  Unclear: "neutral",
  "Likely Human": "positive"
};

const verdictLabelMap: Record<Verdict, string> = {
  "Likely AI": "likely_ai",
  Unclear: "unclear",
  "Likely Human": "likely_human"
};

const toneStyles: Record<VerdictTone, { pill: string; bar: string; text: string }> =
  {
    positive: {
      pill: "bg-[#e5efe7] text-[#2f4b3a] border border-[#cfe0d6]",
      bar: "bg-[#7fa793]",
      text: "text-[#2f4b3a]"
    },
    neutral: {
      pill: "bg-[#eef1f3] text-[#4a5560] border border-[#d8dde2]",
      bar: "bg-[#b7c1c9]",
      text: "text-[#4a5560]"
    },
    caution: {
      pill: "bg-[#f0e4de] text-[#6a4033] border border-[#e2ccc2]",
      bar: "bg-[#c98c79]",
      text: "text-[#6a4033]"
    }
  };

const IMPROVEMENT_TIPS = [
  "Vary sentence length to reduce uniform cadence.",
  "Add personal context or a concrete detail.",
  "Reduce repeated structures and transitions.",
  "Use natural transitions between ideas."
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeSignal = (signal: string) => {
  const trimmed = signal.trim();
  if (!trimmed) {
    return "this pattern";
  }
  if (
    trimmed.length > 1 &&
    trimmed[0] === trimmed[0].toUpperCase() &&
    trimmed[1] === trimmed[1].toUpperCase()
  ) {
    return trimmed;
  }
  return trimmed[0].toLowerCase() + trimmed.slice(1);
};

const buildSignalDetails = (signal: string, useRawSignal = false) => ({
  meaning: useRawSignal ? signal : `Your text shows ${normalizeSignal(signal)}.`,
  why: "This pattern is commonly associated with AI-assisted or highly uniform writing.",
  impact: "It influences the confidence score alongside the other signals."
});

const buildSummaryLine = (verdict: Verdict) => {
  if (verdict === "Likely AI") {
    return "Signals suggest patterns commonly associated with AI-generated text.";
  }
  if (verdict === "Likely Human") {
    return "Signals suggest patterns commonly associated with human writing.";
  }
  return "Signals suggest a mixed pattern across common detectors.";
};

const isPreferredResponse = (value: unknown): value is PreferredResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as PreferredResponse;
  const hasVerdict =
    data.verdict === "Likely AI" ||
    data.verdict === "Unclear" ||
    data.verdict === "Likely Human";
  const hasConfidence = typeof data.confidence === "number";
  const hasBreakdown = Array.isArray(data.breakdown);

  return hasVerdict && hasConfidence && hasBreakdown;
};

export default function Home() {
  const supabase = getSupabaseBrowserClient();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<RunSnapshot | null>(null);
  const [pendingEdit, setPendingEdit] = useState<RunSnapshot | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [comparisonBase, setComparisonBase] = useState<RunSnapshot | null>(null);
  const [upgradeIntent, setUpgradeIntent] = useState<null | "edit">(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [timeoutMs, setTimeoutMs] = useState(TIMEOUT_MS);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const refreshUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) {
        return;
      }
      if (error) {
        setUser(null);
      } else {
        setUser(data.user ?? null);
      }
      setAuthReady(true);
    };

    void refreshUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      if (!isMounted) {
        return;
      }
      void refreshUser();
    });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshUser();
      }
    };

    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["enable_tips", "analysis_timeout_seconds"]);

      if (!isMounted || !data) {
        return;
      }

      const map = new Map(data.map((row) => [row.key, row.value]));
      const tips = map.get("enable_tips");
      const timeoutSeconds = Number(map.get("analysis_timeout_seconds"));

      if (typeof tips === "boolean") {
        setTipsEnabled(tips);
      }

      if (!Number.isNaN(timeoutSeconds) && timeoutSeconds > 0) {
        setTimeoutMs(timeoutSeconds * 1000);
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const trimmed = text.trim();
  const charCount = text.length;
  const underMin = trimmed.length < MIN_CHARS;
  const isWebhookMissing = WEBHOOK_URL.length === 0;
  const plan = useMemo<PlanTier>(() => {
    const raw = typeof user?.user_metadata?.plan === "string"
      ? user.user_metadata.plan.toLowerCase()
      : "";
    if (raw === "starter" || raw === "pro") {
      return raw;
    }
    return "free";
  }, [user]);
  const canEdit = plan !== "free";
  const maxChars = plan === "free" ? FREE_MAX_CHARS : MAX_CHARS;
  const exceedsMax = charCount > maxChars;

  const canAnalyze =
    !isLoading && !isFileLoading && !exceedsMax && !underMin && !isWebhookMissing;

  const confidencePercent = useMemo(() => {
    if (!result || result.type !== "preferred") {
      return 0;
    }

    return Math.round(clamp(result.data.confidence, 0, 1) * 100);
  }, [result]);

  const summaryLine = useMemo(() => {
    if (!result || result.type !== "preferred") {
      return "";
    }
    return buildSummaryLine(result.data.verdict);
  }, [result]);

  const detectedSignals = useMemo(() => {
    if (!result || result.type !== "preferred") {
      return [];
    }
    const signals = (result.data.signals ?? [])
      .map((signal) => signal.trim())
      .filter(Boolean);
    if (signals.length > 0) {
      return signals;
    }
    return (result.data.breakdown ?? [])
      .map((item) => item.trim())
      .filter(Boolean);
  }, [result]);

  const usesBreakdownSignals = useMemo(() => {
    if (!result || result.type !== "preferred") {
      return false;
    }
    return !result.data.signals || result.data.signals.length === 0;
  }, [result]);

  const handleClear = () => {
    setText("");
    setResult(null);
    setRequestError(null);
    setFileError(null);
    setSaveError(null);
    setPendingEdit(null);
    setComparison(null);
    setComparisonBase(null);
    setUpgradeIntent(null);
    setUploadedFileName(null);
  };

  const persistRun = async (
    runResult: ResultState,
    inputText: string,
    rawData: unknown,
    parentRunId: string | null,
    receivedAt: string
  ) => {
    if (!user) {
      return;
    }

    const label =
      runResult.type === "preferred"
        ? verdictLabelMap[runResult.data.verdict]
        : "unknown";
    const score =
      runResult.type === "preferred"
        ? clamp(runResult.data.confidence, 0, 1)
        : 0;
    const explanation =
      runResult.type === "preferred"
        ? runResult.data.breakdown?.[0] ?? null
        : null;
    const model =
      runResult.type === "preferred" ? runResult.data.model ?? null : null;
    const meta =
      runResult.type === "preferred"
        ? {
            verdict: runResult.data.verdict,
            confidence: score,
            breakdown: runResult.data.breakdown,
            signals: runResult.data.signals ?? [],
            received_at: runResult.receivedAt
          }
        : {
            raw: rawData,
            received_at: runResult.receivedAt
          };

    try {
      const { error } = await supabase.from("detector_runs").insert({
        user_id: user.id,
        input_text: inputText,
        result_label: label,
        result_score: score,
        explanation,
        provider: "n8n",
        model,
        meta
      });

      if (error) {
        setSaveError("We could not save this run to your history.");
      }
    } catch {
      setSaveError("We could not save this run to your history.");
    }

    try {
      const { data } = await supabase
        .from("analysis_runs")
        .insert({
          user_id: user.id,
          input_text: inputText,
          char_count: inputText.length,
          verdict: runResult.type === "preferred" ? runResult.data.verdict : null,
          confidence: runResult.type === "preferred" ? Math.round(score * 10000) / 100 : null,
          breakdown: runResult.type === "preferred" ? runResult.data.breakdown : null,
          signals: runResult.type === "preferred" ? runResult.data.signals ?? null : null,
          model,
          webhook_status: "success",
          raw_response: rawData,
          parent_run_id: parentRunId
        })
        .select("id")
        .single();

      if (data?.id) {
        setLatestSnapshot((prev) =>
          prev && prev.receivedAt === receivedAt
            ? { ...prev, analysisRunId: data.id }
            : prev
        );
      }
    } catch {
      setSaveError("We could not save this run to your history.");
    }
  };

  const persistErrorRun = async (status: "error" | "timeout", message: string) => {
    if (!user) {
      return;
    }

    try {
      await supabase.from("analysis_runs").insert({
        user_id: user.id,
        input_text: trimmed,
        char_count: trimmed.length,
        webhook_status: status,
        error_message: message
      });
    } catch {
      setSaveError("We could not save this run to your history.");
    }
  };

  const handleAnalyze = async () => {
    if (isLoading || isFileLoading) {
      return;
    }

    if (isWebhookMissing) {
      setRequestError(
        "Analysis endpoint is not configured. Add NEXT_PUBLIC_N8N_WEBHOOK_URL to enable checks."
      );
      return;
    }

    if (exceedsMax) {
      setRequestError(`Please keep the text under ${maxChars} characters.`);
      return;
    }

    if (underMin) {
      setRequestError(`Please enter at least ${MIN_CHARS} characters to check.`);
      return;
    }

    setIsLoading(true);
    setRequestError(null);
    setFileError(null);
    setSaveError(null);
    setResult(null);
    setComparison(null);
    setUpgradeIntent(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: trimmed,
          meta: {
            source: "veridict-frontend",
            timestamp: new Date().toISOString()
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      const data = (await response.json()) as unknown;
      const receivedAt = new Date().toISOString();

      if (isPreferredResponse(data)) {
        const preferredResult = { type: "preferred", data, receivedAt } as const;
        setResult(preferredResult);
        const snapshot: RunSnapshot = {
          inputText: trimmed,
          receivedAt,
          result: preferredResult,
          analysisRunId: null,
          userId: user?.id ?? null
        };
        setLatestSnapshot(snapshot);

        if (
          pendingEdit &&
          pendingEdit.userId === (user?.id ?? null) &&
          pendingEdit.result.type === "preferred"
        ) {
          setComparison(
            buildComparison({
              previous: {
                verdict: pendingEdit.result.data.verdict,
                confidence: pendingEdit.result.data.confidence,
                signals: pendingEdit.result.data.signals ?? [],
                text: pendingEdit.inputText
              },
              next: {
                verdict: preferredResult.data.verdict,
                confidence: preferredResult.data.confidence,
                signals: preferredResult.data.signals ?? [],
                text: trimmed
              }
            })
          );
          setComparisonBase(pendingEdit);
        } else {
          setComparisonBase(null);
        }
        setPendingEdit(null);
        void persistRun(
          preferredResult,
          trimmed,
          data,
          pendingEdit?.analysisRunId ?? null,
          receivedAt
        );
      } else {
        const rawResult = { type: "raw", data, receivedAt } as const;
        setResult(rawResult);
        setLatestSnapshot({
          inputText: trimmed,
          receivedAt,
          result: rawResult,
          analysisRunId: null,
          userId: user?.id ?? null
        });
        setComparisonBase(null);
        setPendingEdit(null);
        void persistRun(rawResult, trimmed, data, pendingEdit?.analysisRunId ?? null, receivedAt);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setRequestError(`The request timed out after ${Math.round(timeoutMs / 1000)} seconds. Run it again.`);
        void persistErrorRun("timeout", "Request timeout");
      } else if (error instanceof Error) {
        setRequestError(error.message || "Something went wrong. Run it again.");
        void persistErrorRun("error", error.message || "Request error");
      } else {
        setRequestError("Something went wrong. Run it again.");
        void persistErrorRun("error", "Unknown error");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const focusTextarea = () => {
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsFileLoading(true);
    setFileError(null);

    try {
      const content = await file.text();
      if (content.length > maxChars) {
        setUploadedFileName(null);
        setFileError(
          `File has ${content.length} characters, which exceeds the ${maxChars} character limit for your plan.`
        );
        return;
      }
      handleClear();
      setText(content);
      setUploadedFileName(file.name);
      focusTextarea();
    } catch {
      setUploadedFileName(null);
      setFileError("We could not read that file.");
    } finally {
      setIsFileLoading(false);
      event.target.value = "";
    }
  };

  const startEditFromSnapshot = (snapshot: RunSnapshot | null) => {
    if (!snapshot) {
      return;
    }
    if (!canEdit) {
      setUpgradeIntent("edit");
      return;
    }
    setPendingEdit(snapshot);
    setText(snapshot.inputText);
    setUploadedFileName(null);
    setFileError(null);
    setRequestError(null);
    setComparison(null);
    setUpgradeIntent(null);
    focusTextarea();
  };

  const verdictTone =
    result?.type === "preferred" ? verdictToneMap[result.data.verdict] : "neutral";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4]">
      {isLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#f7f7f4]/95 backdrop-blur">
          <div className="w-full max-w-md px-6" role="status" aria-live="polite">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              Processing
            </p>
            <p className="mt-3 text-lg font-semibold text-[#1f1f1c]">
              Analyzing signals...
            </p>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#d8d6cf]">
              <div className="h-full w-2/3 rounded-full bg-[#2f3e4e] animate-[loading-bar_2.4s_ease-in-out_infinite]" />
            </div>
            <p className="mt-4 text-xs text-[#7a7670]">
              This may take a few seconds.
            </p>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#e6ecf1] opacity-70 blur-3xl" />
        <div className="absolute top-40 right-6 h-56 w-56 rounded-full bg-[#edf2f5] opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[#e9eef2] opacity-50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-6 pb-16 pt-14">
        <header className="opacity-0 animate-fade-up">
          <p className="text-xs uppercase tracking-[0.4em] text-[#7a7670]">
            Veridict
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-[#1f1f1c] sm:text-5xl">
            Check your work before you submit it.
          </h1>
          <p className="mt-4 max-w-xl text-base text-[#4c4b45]">
            Understand AI detection signals and avoid surprises when it matters.
          </p>
          <p className="mt-3 max-w-xl text-sm text-[#7a7670]">
            Built for students who want clarity, not accusations.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-[#2f3e4e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#3b4d60]"
              onClick={focusTextarea}
            >
              Run a check
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-[#c4c1b8] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#4c4b45] transition hover:border-[#9b978f]"
            >
              See how it works
            </a>
          </div>
        </header>

        <section
          className="mt-10 rounded-3xl border border-[#d8d6cf] bg-white/85 p-5 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur opacity-0 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            <span>Your text</span>
            <span className={`font-mono ${exceedsMax ? "text-[#6a4033]" : ""}`}>
              {charCount}/{maxChars}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#7a7670]">
              <span>Upload a .txt or .md file.</span>
              {uploadedFileName && (
                <span
                  className="max-w-[220px] truncate text-[#4c4b45]"
                  title={uploadedFileName}
                >
                  Loaded: {uploadedFileName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={FILE_ACCEPT}
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c4c1b8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4c4b45] transition hover:border-[#9b978f] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isFileLoading}
                aria-busy={isFileLoading}
              >
                <span
                  className={`h-3 w-3 rounded-full border-2 border-current border-t-transparent transition-opacity ${
                    isFileLoading ? "animate-spin opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
                {isFileLoading ? "Loading..." : "Choose file"}
              </button>
            </div>
          </div>
          {fileError && (
            <p className="mt-2 text-xs text-[#6a4033]">{fileError}</p>
          )}
          {pendingEdit && (
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-[#7a7670]">
              Editing previous run from {new Date(pendingEdit.receivedAt).toLocaleString()}
            </p>
          )}
          <textarea
            ref={textareaRef}
            className="mt-4 min-h-[260px] w-full resize-none rounded-2xl border border-[#d8d6cf] bg-white/90 p-4 text-base leading-relaxed text-[#1f1f1c] shadow-sm transition focus:border-[#8fa3b5] focus:outline-none focus:ring-4 focus:ring-[#d7e1ea] disabled:opacity-70"
            placeholder="Paste or type your draft here."
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setFileError(null);
            }}
            disabled={isLoading}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p
              className={`text-sm ${exceedsMax ? "text-[#6a4033]" : "text-[#4c4b45]"}`}
            >
              {exceedsMax
                ? `Maximum ${maxChars} characters exceeded.`
                : `Minimum ${MIN_CHARS} characters to check.`}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2f3e4e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#3b4d60] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f7f7f4]/40 border-t-[#f7f7f4]" />
                    Checking...
                  </>
                ) : (
                  "Run a check"
                )}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-[#c4c1b8] px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#4c4b45] transition hover:border-[#9b978f] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleClear}
                disabled={isLoading || isFileLoading || text.length === 0}
              >
                Clear
              </button>
            </div>
          </div>
          <TipRotator isActive={isLoading && tipsEnabled} />
        </section>

        {isWebhookMissing && (
          <div
            className="mt-6 rounded-2xl border border-[#e2ccc2] bg-[#f0e4de] p-4 text-sm text-[#6a4033] opacity-0 animate-fade-in"
            style={{ animationDelay: "160ms" }}
          >
            Analysis endpoint is not configured. Add NEXT_PUBLIC_N8N_WEBHOOK_URL to
            enable checks.
          </div>
        )}

        {requestError && !isWebhookMissing && (
          <div
            className="mt-6 rounded-2xl border border-[#e2ccc2] bg-[#f0e4de] p-4 text-sm text-[#6a4033] opacity-0 animate-fade-in"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{requestError}</span>
              <button
                type="button"
                className="rounded-full border border-[#c7b1a7] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#6a4033]"
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                Run again
              </button>
            </div>
          </div>
        )}

        {result?.type === "preferred" && (
          <section
            className="mt-10 rounded-3xl border border-[#d8d6cf] bg-white/90 p-6 shadow-[0_20px_80px_rgba(24,22,18,0.1)] backdrop-blur opacity-0 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  Verdict summary
                </p>
                <div
                  className={`mt-3 inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${
                    toneStyles[verdictTone].pill
                  }`}
                >
                  {result.data.verdict}
                </div>
                <p className="mt-3 text-sm text-[#4c4b45]">{summaryLine}</p>
              </div>
              <div className="rounded-2xl border border-[#d8d6cf] bg-[#f7f7f4] p-4">
                <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  <span>Confidence</span>
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#c4c1b8] text-[10px] text-[#4c4b45]"
                    title="The confidence score reflects probability, not certainty."
                  >
                    i
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-[#1f1f1c]">
                  {confidencePercent}%
                </p>
                <p className="mt-1 text-xs text-[#7a7670]">
                  The confidence score reflects probability, not certainty.
                </p>
                {result.data.model && (
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#7a7670]">
                    Model: {result.data.model}
                  </p>
                )}
                <p className="mt-2 text-xs text-[#7a7670]">
                  Generated at {new Date(result.receivedAt).toLocaleTimeString()}.
                </p>
              </div>
            </div>

            <div className="mt-6 h-2 w-full rounded-full bg-[#e3e1db]">
              <div
                className={`h-2 rounded-full transition-all ${
                  toneStyles[verdictTone].bar
                }`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  Detected signals
                </span>
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#c4c1b8] text-[10px] text-[#4c4b45]"
                  title="Each signal includes what it means, why it matters, and how it affects the score."
                >
                  i
                </span>
              </div>
              {detectedSignals.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {detectedSignals.map((signal, index) => {
                    const details = buildSignalDetails(signal, usesBreakdownSignals);
                    return (
                      <li
                        key={`${signal}-${index}`}
                        className="rounded-2xl border border-[#d8d6cf] bg-white/95 p-4"
                      >
                        <details className="group">
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2f3e4e]" />
                              <span className="text-sm text-[#1f1f1c]">{signal}</span>
                            </div>
                            <span className="text-xs uppercase tracking-[0.2em] text-[#7a7670]">
                              Details
                            </span>
                          </summary>
                          <div className="mt-3 space-y-2 text-sm text-[#4c4b45]">
                            <p>
                              <span className="font-semibold text-[#1f1f1c]">
                                What it means:
                              </span>{" "}
                              {details.meaning}
                            </p>
                            <p>
                              <span className="font-semibold text-[#1f1f1c]">
                                Why it matters:
                              </span>{" "}
                              {details.why}
                            </p>
                            <p>
                              <span className="font-semibold text-[#1f1f1c]">
                                How it affects the score:
                              </span>{" "}
                              {details.impact}
                            </p>
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-4 rounded-2xl border border-[#d8d6cf] bg-[#f3f3ef] p-4 text-sm text-[#4c4b45]">
                  No signal list was returned. Review the verdict summary and consider another run.
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-[#d8d6cf] bg-[#f3f3ef] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                What you can improve
              </p>
              <p className="mt-2 text-sm text-[#4c4b45]">
                You may want to review the following.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[#4c4b45]">
                {IMPROVEMENT_TIPS.map((tip) => (
                  <li key={tip} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2f3e4e]" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#2f3e4e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4]"
                onClick={() => startEditFromSnapshot(latestSnapshot)}
              >
                Edit and recheck
              </button>
              {!canEdit && (
                <span className="inline-flex items-center rounded-full border border-[#d8dde2] bg-[#eef1f3] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#4a5560]">
                  Free plan
                </span>
              )}
            </div>

            {authReady && !user && (
              <div className="mt-6 rounded-2xl border border-[#d8d6cf] bg-[#f7f7f4] px-4 py-3 text-sm text-[#4c4b45]">
                <Link href="/login" className="font-semibold text-[#1f1f1c]">
                  Log in
                </Link>{" "}
                to save your history.
              </div>
            )}

            {authReady && user && saveError && (
              <p className="mt-4 text-xs text-[#6a4033]">{saveError}</p>
            )}
          </section>
        )}

        {result?.type === "raw" && (
          <section
            className="mt-10 rounded-3xl border border-[#d8d6cf] bg-white/90 p-6 shadow-[0_20px_80px_rgba(24,22,18,0.1)] backdrop-blur opacity-0 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  Response
                </p>
                <p className="mt-3 text-lg font-semibold text-[#1f1f1c]">
                  Analysis received
                </p>
                <p className="mt-1 text-sm text-[#4c4b45]">
                  The response did not match the expected schema.
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                {new Date(result.receivedAt).toLocaleTimeString()}
              </p>
            </div>
            <details className="mt-4 rounded-2xl border border-[#d8d6cf] bg-[#f7f7f4]/80 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#4c4b45]">
                Raw output
              </summary>
              <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-[#f1f1ec] p-3 text-xs text-[#2a2924]">
{JSON.stringify(result.data, null, 2)}
              </pre>
            </details>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#2f3e4e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4]"
                onClick={() => startEditFromSnapshot(latestSnapshot)}
              >
                Edit and recheck
              </button>
              {!canEdit && (
                <span className="inline-flex items-center rounded-full border border-[#d8dde2] bg-[#eef1f3] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#4a5560]">
                  Free plan
                </span>
              )}
            </div>

            {authReady && !user && (
              <div className="mt-6 rounded-2xl border border-[#d8d6cf] bg-[#f7f7f4] px-4 py-3 text-sm text-[#4c4b45]">
                <Link href="/login" className="font-semibold text-[#1f1f1c]">
                  Log in
                </Link>{" "}
                to save your history.
              </div>
            )}

            {authReady && user && saveError && (
              <p className="mt-4 text-xs text-[#6a4033]">{saveError}</p>
            )}
          </section>
        )}

        {comparison && comparisonBase && (
          <WhatChangedPanel
            comparison={comparison}
            parentLabel={new Date(comparisonBase.receivedAt).toLocaleString()}
          />
        )}

        {!canEdit && upgradeIntent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-6 backdrop-blur-sm transition-opacity duration-200 animate-fade-in">
            <div className="w-full max-w-2xl rounded-3xl border border-[#d8d6cf] bg-[#f3f3ef] p-6 shadow-[0_22px_70px_rgba(27,24,19,0.2)] transition-all duration-200 ease-out animate-fade-up">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#1f1f1c]">
                    Edit feedback helps you understand why a result changed.
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#7a7670]">
                    Edit recheck and change tracking
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[#c4c1b8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#4c4b45] transition hover:border-[#9b978f]"
                  onClick={() => setUpgradeIntent(null)}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <LoadingLink
                  href="/pricing"
                  className="rounded-full bg-[#2f3e4e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#3b4d60]"
                >
                  Upgrade to Starter
                </LoadingLink>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-[#c4c1b8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4c4b45]"
              onClick={() => startEditFromSnapshot(latestSnapshot)}
            >
              Check another edit
            </button>
          </div>
        )}

        <section
          id="how-it-works"
          className="mt-12 rounded-3xl border border-[#d8d6cf] bg-white/85 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur opacity-0 animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            How it works
          </p>
          <div className="mt-4 space-y-2 text-sm text-[#4c4b45]">
            <p>Paste your draft.</p>
            <p>Review signals and probability.</p>
            <p>Decide what to adjust before submission.</p>
          </div>
        </section>

        <footer
          className="mt-auto pt-12 text-xs uppercase tracking-[0.3em] text-[#7a7670] opacity-0 animate-fade-in"
          style={{ animationDelay: "240ms" }}
        >
          You control where your text is analyzed.
        </footer>
      </div>
    </main>
  );
}
