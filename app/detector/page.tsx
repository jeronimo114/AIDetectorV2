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

const DEMO_RESULT: PreferredResponse = {
  verdict: "Unclear",
  confidence: 0.66,
  breakdown: ["Signals suggest a mixed pattern across common detectors."],
  signals: [
    "Uniform sentence cadence",
    "Limited idiomatic variation",
    "Low burstiness across paragraphs"
  ],
  model: "DETECTOR-V1"
};

const toneStyles: Record<VerdictTone, { pill: string; bar: string; text: string; glow: string }> = {
  positive: {
    pill: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    text: "text-emerald-400",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]"
  },
  neutral: {
    pill: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    bar: "bg-gradient-to-r from-amber-500 to-amber-400",
    text: "text-amber-400",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]"
  },
  caution: {
    pill: "bg-red-500/10 text-red-400 border border-red-500/30",
    bar: "bg-gradient-to-r from-red-500 to-red-400",
    text: "text-red-400",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]"
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
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showLockedResults, setShowLockedResults] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [timeoutMs, setTimeoutMs] = useState(TIMEOUT_MS);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const authGateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (user) {
      setShowAuthGate(false);
      setShowLockedResults(false);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (authGateTimerRef.current) {
        clearTimeout(authGateTimerRef.current);
      }
    };
  }, []);

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
    setShowAuthGate(false);
    setShowLockedResults(false);
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

    if (exceedsMax) {
      setRequestError(`Please keep the text under ${maxChars} characters.`);
      return;
    }

    if (underMin) {
      setRequestError(`Please enter at least ${MIN_CHARS} characters to check.`);
      return;
    }

    if (!user) {
      if (authGateTimerRef.current) {
        clearTimeout(authGateTimerRef.current);
      }
      setIsLoading(true);
      setRequestError(null);
      setFileError(null);
      setSaveError(null);
      setResult(null);
      setComparison(null);
      setComparisonBase(null);
      setPendingEdit(null);
      setUpgradeIntent(null);
      setShowAuthGate(false);
      setShowLockedResults(false);

      authGateTimerRef.current = setTimeout(() => {
        const receivedAt = new Date().toISOString();
        const previewResult = {
          type: "preferred",
          data: DEMO_RESULT,
          receivedAt
        } as const;
        setResult(previewResult);
        setLatestSnapshot({
          inputText: trimmed,
          receivedAt,
          result: previewResult,
          analysisRunId: null,
          userId: null
        });
        setShowLockedResults(true);
        setShowAuthGate(true);
        setIsLoading(false);
      }, 1600);
      return;
    }

    if (isWebhookMissing) {
      setRequestError(
        "Analysis endpoint is not configured. Add NEXT_PUBLIC_N8N_WEBHOOK_URL to enable checks."
      );
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
  const lockResults = showLockedResults && !user;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050810]/95 backdrop-blur-xl">
          <div className="w-full max-w-md px-6 text-center" role="status" aria-live="polite">
            {/* Orbital animation */}
            <div className="relative mx-auto mb-8 h-24 w-24">
              <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full border border-amber-500/30" />
              <div className="absolute inset-4 rounded-full border border-amber-500/40" />
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                <div className="absolute top-0 left-1/2 -ml-1.5 h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
              </div>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-500/80">
              Processing
            </p>
            <p className="mt-3 font-serif text-2xl font-semibold text-white">
              Analyzing signals...
            </p>
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 animate-[loading-bar_2s_ease-in-out_infinite]" />
            </div>
            <p className="mt-4 text-sm text-slate-500">
              This may take a few seconds.
            </p>
          </div>
        </div>
      )}

      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[100px]" />
        <div className="absolute top-[50%] -right-[15%] h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[80px]" />
        <div className="absolute top-[30%] -left-[10%] h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[60px]" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[800px] flex-col px-6 pb-16 pt-14">
        {/* Header */}
        <header className="opacity-0 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-amber-400">
              AI Writing Detector
            </span>
          </div>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
            Check your work before
            <span className="block text-gradient">you submit it</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-400">
            Understand AI detection signals and avoid surprises when it matters.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-[#050810] shadow-[0_4px_20px_-4px_rgba(245,158,11,0.4)] transition-all hover:shadow-[0_6px_30px_-4px_rgba(245,158,11,0.5)] hover:-translate-y-0.5"
              onClick={focusTextarea}
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="12" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Run Analysis
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-6 py-3 text-sm font-medium text-white transition-all hover:border-slate-600 hover:bg-slate-800"
            >
              How it works
            </a>
          </div>
        </header>

        {/* Input Section */}
        <section
          className="mt-10 rounded-2xl glass-card p-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-amber-500">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500">Input</p>
                <p className="text-lg font-semibold text-white">Your Text</p>
              </div>
            </div>
            <span className={`font-mono text-sm ${exceedsMax ? "text-red-400" : "text-slate-500"}`}>
              {charCount}/{maxChars}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>Upload .txt or .md</span>
              {uploadedFileName && (
                <span className="max-w-[200px] truncate text-amber-400" title={uploadedFileName}>
                  {uploadedFileName}
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
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isFileLoading}
                aria-busy={isFileLoading}
              >
                <span
                  className={`h-3 w-3 rounded-full border-2 border-current border-t-transparent transition-opacity ${
                    isFileLoading ? "animate-spin opacity-100" : "opacity-0 absolute"
                  }`}
                  aria-hidden="true"
                />
                {isFileLoading ? "Loading..." : "Choose file"}
              </button>
            </div>
          </div>

          {fileError && <p className="mt-2 text-sm text-red-400">{fileError}</p>}
          {pendingEdit && (
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-amber-500/80">
              Editing previous run from {new Date(pendingEdit.receivedAt).toLocaleString()}
            </p>
          )}

          <textarea
            ref={textareaRef}
            className="mt-4 min-h-[260px] w-full resize-none rounded-xl input-field p-4 text-base leading-relaxed placeholder:text-slate-600 disabled:opacity-70"
            placeholder="Paste or type your draft here..."
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setFileError(null);
            }}
            disabled={isLoading}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className={`text-sm ${exceedsMax ? "text-red-400" : "text-slate-500"}`}>
              {exceedsMax
                ? `Maximum ${maxChars} characters exceeded.`
                : `Minimum ${MIN_CHARS} characters to analyze.`}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-[#050810] shadow-[0_4px_20px_-4px_rgba(245,158,11,0.4)] transition-all hover:shadow-[0_6px_30px_-4px_rgba(245,158,11,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#050810]/40 border-t-[#050810]" />
                    Analyzing...
                  </>
                ) : (
                  "Run Analysis"
                )}
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800/50 px-5 py-3 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
                onClick={handleClear}
                disabled={isLoading || isFileLoading || text.length === 0}
              >
                Clear
              </button>
            </div>
          </div>
          <TipRotator isActive={isLoading && tipsEnabled} />
        </section>

        {/* Error Messages */}
        {isWebhookMissing && (
          <div
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 opacity-0 animate-fade-in"
            style={{ animationDelay: "160ms" }}
          >
            Analysis endpoint is not configured. Add NEXT_PUBLIC_N8N_WEBHOOK_URL to enable checks.
          </div>
        )}

        {requestError && !isWebhookMissing && (
          <div
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 opacity-0 animate-fade-in"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{requestError}</span>
              <button
                type="button"
                className="rounded-lg border border-red-500/30 px-4 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                Run again
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result?.type === "preferred" && (
          <section
            className="relative mt-10 rounded-2xl glass-card p-6 opacity-0 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className={lockResults ? "pointer-events-none blur-sm" : ""}>
              {/* Verdict & Confidence */}
              <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    Verdict Summary
                  </p>
                  <div className={`mt-3 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${toneStyles[verdictTone].pill}`}>
                    <span className={`mr-2 h-2 w-2 rounded-full ${verdictTone === 'positive' ? 'bg-emerald-500' : verdictTone === 'caution' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    {result.data.verdict}
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{summaryLine}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono uppercase tracking-wider text-slate-500">Confidence</span>
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 text-[10px] text-slate-400"
                      title="The confidence score reflects probability, not certainty."
                    >
                      ?
                    </span>
                  </div>
                  <p className={`mt-3 font-mono text-4xl font-bold ${toneStyles[verdictTone].text}`}>
                    {confidencePercent}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Probability, not certainty.
                  </p>
                  {result.data.model && (
                    <p className="mt-2 font-mono text-xs text-slate-600">
                      Model: {result.data.model}
                    </p>
                  )}
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mt-6 h-2 w-full rounded-full bg-slate-800">
                <div
                  className={`h-2 rounded-full transition-all ${toneStyles[verdictTone].bar} ${toneStyles[verdictTone].glow}`}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>

              {/* Detected Signals */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    Detected Signals
                  </span>
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 text-[10px] text-slate-400"
                    title="Each signal includes what it means, why it matters, and how it affects the score."
                  >
                    ?
                  </span>
                </div>
                {detectedSignals.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {detectedSignals.map((signal, index) => {
                      const details = buildSignalDetails(signal, usesBreakdownSignals);
                      return (
                        <li
                          key={`${signal}-${index}`}
                          className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
                        >
                          <details className="group">
                            <summary className="flex cursor-pointer items-start justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                              <div className="flex items-start gap-3">
                                <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500" />
                                <span className="text-sm text-white">{signal}</span>
                              </div>
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-all group-open:border-amber-500/50 group-open:bg-amber-500/10 group-open:text-amber-500">
                                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 transition-transform group-open:rotate-180">
                                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            </summary>
                            <div className="border-t border-slate-800 px-4 py-4 space-y-2 text-sm text-slate-400">
                              <p>
                                <span className="font-medium text-white">What it means:</span>{" "}
                                {details.meaning}
                              </p>
                              <p>
                                <span className="font-medium text-white">Why it matters:</span>{" "}
                                {details.why}
                              </p>
                              <p>
                                <span className="font-medium text-white">How it affects the score:</span>{" "}
                                {details.impact}
                              </p>
                            </div>
                          </details>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
                    No signal list was returned. Review the verdict summary.
                  </div>
                )}
              </div>

              {/* Improvement Tips */}
              <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  Suggestions
                </p>
                <ul className="mt-3 space-y-2">
                  {IMPROVEMENT_TIPS.map((tip) => (
                    <li key={tip} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span className="text-sm text-slate-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-[#050810] shadow-[0_4px_20px_-4px_rgba(245,158,11,0.4)] transition-all hover:shadow-[0_6px_30px_-4px_rgba(245,158,11,0.5)]"
                  onClick={() => startEditFromSnapshot(latestSnapshot)}
                >
                  Edit and recheck
                </button>
                {!canEdit && (
                  <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-400">
                    Free plan
                  </span>
                )}
              </div>

              {authReady && !user && (
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
                  <Link href="/login" className="font-semibold text-amber-400 hover:text-amber-300">
                    Log in
                  </Link>{" "}
                  to save your history.
                </div>
              )}

              {authReady && user && saveError && (
                <p className="mt-4 text-sm text-red-400">{saveError}</p>
              )}
            </div>

            {/* Lock overlay */}
            {lockResults && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#050810]/80 backdrop-blur-sm">
                <div className="mx-auto max-w-[280px] rounded-xl glass-card p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-amber-500">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="mt-3 font-medium text-white">Create an account</p>
                  <p className="mt-1 text-sm text-slate-400">to view your full report</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Raw result fallback */}
        {result?.type === "raw" && (
          <section
            className="mt-10 rounded-2xl glass-card p-6 opacity-0 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500">Response</p>
                <p className="mt-2 text-lg font-semibold text-white">Analysis received</p>
                <p className="mt-1 text-sm text-slate-400">
                  The response did not match the expected schema.
                </p>
              </div>
              <p className="font-mono text-xs text-slate-500">
                {new Date(result.receivedAt).toLocaleTimeString()}
              </p>
            </div>
            <details className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <summary className="cursor-pointer p-4 text-sm font-medium text-slate-300 [&::-webkit-details-marker]:hidden">
                View raw output
              </summary>
              <pre className="border-t border-slate-800 p-4 max-h-80 overflow-auto font-mono text-xs text-slate-400">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-[#050810]"
                onClick={() => startEditFromSnapshot(latestSnapshot)}
              >
                Edit and recheck
              </button>
            </div>

            {authReady && !user && (
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
                <Link href="/login" className="font-semibold text-amber-400">
                  Log in
                </Link>{" "}
                to save your history.
              </div>
            )}
          </section>
        )}

        {comparison && comparisonBase && (
          <WhatChangedPanel
            comparison={comparison}
            parentLabel={new Date(comparisonBase.receivedAt).toLocaleString()}
          />
        )}

        {/* Upgrade Modal */}
        {!canEdit && upgradeIntent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050810]/80 p-6 backdrop-blur-xl animate-fade-in">
            <div className="w-full max-w-lg rounded-2xl glass-card p-6 animate-scale-in">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">
                    Edit feedback helps you understand why a result changed.
                  </p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-slate-500">
                    Edit recheck and change tracking
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                  onClick={() => setUpgradeIntent(null)}
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                    <path d="M6 6l8 8M6 14l8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="mt-6">
                <LoadingLink
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-[#050810] shadow-[0_4px_20px_-4px_rgba(245,158,11,0.4)]"
                >
                  Upgrade to Starter
                </LoadingLink>
              </div>
            </div>
          </div>
        )}

        {/* Auth Gate Modal */}
        {showAuthGate && !user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050810]/80 p-6 backdrop-blur-xl">
            <div className="w-full max-w-lg rounded-2xl glass-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-amber-500">
                  <path d="M12 15v2m0-8v4m0 8c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-bold text-white">
                View your full report
              </h3>
              <p className="mt-2 text-slate-400">
                Create an account to unlock detailed signals, save your history, and track revisions over time.
              </p>
              <div className="mt-6 space-y-3">
                <LoadingLink
                  href="/signup?redirectedFrom=/detector"
                  className="block w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-center text-sm font-semibold text-[#050810] shadow-[0_4px_20px_-4px_rgba(245,158,11,0.4)]"
                >
                  Create Free Account
                </LoadingLink>
                <LoadingLink
                  href="/login?redirectedFrom=/detector"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 text-center text-sm font-medium text-white transition-all hover:border-slate-600 hover:bg-slate-800"
                >
                  Already have an account? Log in
                </LoadingLink>
              </div>
              <button
                type="button"
                className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-400 transition-colors"
                onClick={() => setShowAuthGate(false)}
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        {/* Another check button */}
        {result && !lockResults && (
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800"
              onClick={() => startEditFromSnapshot(latestSnapshot)}
            >
              Check another edit
            </button>
          </div>
        )}

        {/* How it works section */}
        <section
          id="how-it-works"
          className="mt-12 rounded-2xl glass-card p-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          <p className="font-mono text-xs uppercase tracking-wider text-amber-500">
            How it works
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Paste your draft", desc: "Enter or upload your text" },
              { step: "02", title: "Review signals", desc: "See what patterns are detected" },
              { step: "03", title: "Revise & recheck", desc: "Improve and verify your changes" }
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <span className="font-mono text-2xl font-bold text-amber-500/30">{item.step}</span>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          className="mt-auto pt-12 text-center font-mono text-xs uppercase tracking-wider text-slate-600 opacity-0 animate-fade-in"
          style={{ animationDelay: "240ms" }}
        >
          Signals over accusations · Probability over certainty
        </footer>
      </div>
    </main>
  );
}
