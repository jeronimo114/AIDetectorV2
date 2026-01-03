"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

import TipRotator from "@/components/TipRotator";
import WhatChangedPanel from "@/components/WhatChangedPanel";
import type { Comparison, Verdict } from "@/lib/analysis/compare";
import { buildComparison } from "@/lib/analysis/compare";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MIN_CHARS = 80;
const MAX_CHARS = 12000;
const FREE_MAX_CHARS = 1500;
const TIMEOUT_MS = 20000;
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
      pill: "bg-[#e6f2dd] text-[#1f3b1f] border border-[#c6e0b5]",
      bar: "bg-[#87b37a]",
      text: "text-[#1f3b1f]"
    },
    neutral: {
      pill: "bg-[#efe9d9] text-[#6a5b3f] border border-[#e0d6bf]",
      bar: "bg-[#c9b58b]",
      text: "text-[#6a5b3f]"
    },
    caution: {
      pill: "bg-[#f7d9d2] text-[#712d21] border border-[#edb8aa]",
      bar: "bg-[#d48a78]",
      text: "text-[#712d21]"
    }
  };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

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
  const [text, setText] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<RunSnapshot | null>(null);
  const [pendingEdit, setPendingEdit] = useState<RunSnapshot | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [comparisonBase, setComparisonBase] = useState<RunSnapshot | null>(null);
  const [upgradeIntent, setUpgradeIntent] = useState<null | "edit">(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [timeoutMs, setTimeoutMs] = useState(TIMEOUT_MS);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }
        setUser(session?.user ?? null);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
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

  const canAnalyze = !isLoading && !exceedsMax && !underMin && !isWebhookMissing;

  const confidencePercent = useMemo(() => {
    if (!result || result.type !== "preferred") {
      return 0;
    }

    return Math.round(clamp(result.data.confidence, 0, 1) * 100);
  }, [result]);

  const handleClear = () => {
    setText("");
    setResult(null);
    setRequestError(null);
    setSaveError(null);
    setPendingEdit(null);
    setComparison(null);
    setComparisonBase(null);
    setUpgradeIntent(null);
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
    if (isLoading) {
      return;
    }

    if (isWebhookMissing) {
      setRequestError(
        "Missing NEXT_PUBLIC_N8N_WEBHOOK_URL. Add it to your environment to analyze text."
      );
      return;
    }

    if (exceedsMax) {
      setRequestError(`Please keep the text under ${maxChars} characters.`);
      return;
    }

    if (underMin) {
      setRequestError(`Please enter at least ${MIN_CHARS} characters to analyze.`);
      return;
    }

    setIsLoading(true);
    setRequestError(null);
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
            source: "ai-detector-frontend",
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
        setRequestError(`The request timed out after ${Math.round(timeoutMs / 1000)} seconds. Try again.`);
        void persistErrorRun("timeout", "Request timeout");
      } else if (error instanceof Error) {
        setRequestError(error.message || "Something went wrong. Try again.");
        void persistErrorRun("error", error.message || "Request error");
      } else {
        setRequestError("Something went wrong. Try again.");
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
    setRequestError(null);
    setComparison(null);
    setUpgradeIntent(null);
    focusTextarea();
  };

  const verdictTone =
    result?.type === "preferred" ? verdictToneMap[result.data.verdict] : "neutral";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f7f1]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#e5edd8] opacity-70 blur-3xl" />
        <div className="absolute top-40 right-6 h-56 w-56 rounded-full bg-[#f3e3cf] opacity-70 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[#e6e2f2] opacity-40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-6 pb-16 pt-14">
        <header className="opacity-0 animate-fade-up">
          <p className="text-xs uppercase tracking-[0.4em] text-[#7b756a]">
            Signal Lab
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-[#1f1d18] sm:text-5xl">
            AI Detector
          </h1>
          <p className="mt-4 max-w-xl text-base text-[#4f4a40]">
            Paste text to estimate likelihood of AI generation.
          </p>
        </header>

        <section
          className="mt-10 rounded-3xl border border-[#d6d2c6] bg-white/70 p-5 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur opacity-0 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#7b756a]">
            <span>Input</span>
            <span className={`font-mono ${exceedsMax ? "text-[#8d3b2f]" : ""}`}>
              {charCount}/{maxChars}
            </span>
          </div>
          {pendingEdit && (
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-[#8b857a]">
              Editing previous run from {new Date(pendingEdit.receivedAt).toLocaleString()}
            </p>
          )}
          <textarea
            ref={textareaRef}
            className="mt-4 min-h-[260px] w-full resize-none rounded-2xl border border-[#d6d2c6] bg-white/80 p-4 text-base leading-relaxed text-[#1f1d18] shadow-sm transition focus:border-[#a8b09a] focus:outline-none focus:ring-4 focus:ring-[#dfe4d3] disabled:opacity-70"
            placeholder="Paste or type your text here."
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={isLoading}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p
              className={`text-sm ${exceedsMax ? "text-[#8d3b2f]" : "text-[#6a6459]"}`}
            >
              {exceedsMax
                ? `Maximum ${maxChars} characters exceeded.`
                : `Minimum ${MIN_CHARS} characters to analyze.`}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f2a1f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#f6f5ef] transition hover:bg-[#2b3a2b] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f6f5ef]/40 border-t-[#f6f5ef]" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-[#b9b4a6] px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#4f4a40] transition hover:border-[#8f8a7c] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleClear}
                disabled={isLoading || text.length === 0}
              >
                Clear
              </button>
            </div>
          </div>
          <TipRotator isActive={isLoading && tipsEnabled} />
        </section>

        {isWebhookMissing && (
          <div
            className="mt-6 rounded-2xl border border-[#e3c5b9] bg-[#f7e8e4] p-4 text-sm text-[#5a1e14] opacity-0 animate-fade-in"
            style={{ animationDelay: "160ms" }}
          >
            Missing NEXT_PUBLIC_N8N_WEBHOOK_URL. Add it to your environment to
            enable analysis.
          </div>
        )}

        {requestError && !isWebhookMissing && (
          <div
            className="mt-6 rounded-2xl border border-[#e3c5b9] bg-[#f7e8e4] p-4 text-sm text-[#5a1e14] opacity-0 animate-fade-in"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{requestError}</span>
              <button
                type="button"
                className="rounded-full border border-[#5a1e14]/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a1e14]"
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {result?.type === "preferred" && (
          <section
            className="mt-10 rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_20px_80px_rgba(24,22,18,0.1)] backdrop-blur opacity-0 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                  Verdict
                </p>
                <div
                  className={`mt-3 inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${
                    toneStyles[verdictTone].pill
                  }`}
                >
                  {result.data.verdict}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                  Confidence
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#1f1d18]">
                  {confidencePercent}%
                </p>
                {result.data.model && (
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#7b756a]">
                    Model: {result.data.model}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 h-2 w-full rounded-full bg-[#e6e2d6]">
              <div
                className={`h-2 rounded-full transition-all ${
                  toneStyles[verdictTone].bar
                }`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                  Breakdown
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[#2a2822]">
                  {result.data.breakdown.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1f2a1f]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                    Confidence Notes
                  </p>
                  <p className="mt-2 text-sm text-[#4f4a40]">
                    Generated at {new Date(result.receivedAt).toLocaleTimeString()}.
                  </p>
                </div>
                {result.data.signals && result.data.signals.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                      Signals
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-[#2a2822]">
                      {result.data.signals.map((signal, index) => (
                        <li key={`${signal}-${index}`} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#6a6459]" />
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#1f2a1f] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f6f5ef]"
                onClick={() => startEditFromSnapshot(latestSnapshot)}
              >
                Edit and recheck
              </button>
              {!canEdit && (
                <span className="inline-flex items-center rounded-full border border-[#e0d6bf] bg-[#efe9d9] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#6a5b3f]">
                  Free plan
                </span>
              )}
            </div>

            {authReady && !user && (
              <div className="mt-6 rounded-2xl border border-[#d6d2c6] bg-[#f8f7f1] px-4 py-3 text-sm text-[#6a6459]">
                <Link href="/login" className="font-semibold text-[#1f1d18]">
                  Log in
                </Link>{" "}
                to save your history.
              </div>
            )}

            {authReady && user && saveError && (
              <p className="mt-4 text-xs text-[#8d3b2f]">{saveError}</p>
            )}
          </section>
        )}

        {result?.type === "raw" && (
          <section
            className="mt-10 rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_20px_80px_rgba(24,22,18,0.1)] backdrop-blur opacity-0 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                  Response
                </p>
                <p className="mt-3 text-lg font-semibold text-[#1f1d18]">
                  Analysis received
                </p>
                <p className="mt-1 text-sm text-[#4f4a40]">
                  The response did not match the expected schema.
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                {new Date(result.receivedAt).toLocaleTimeString()}
              </p>
            </div>
            <details className="mt-4 rounded-2xl border border-[#d6d2c6] bg-[#f8f7f1]/80 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#4f4a40]">
                Raw output
              </summary>
              <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-[#f1eee6] p-3 text-xs text-[#2a2822]">
{JSON.stringify(result.data, null, 2)}
              </pre>
            </details>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#1f2a1f] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f6f5ef]"
                onClick={() => startEditFromSnapshot(latestSnapshot)}
              >
                Edit and recheck
              </button>
              {!canEdit && (
                <span className="inline-flex items-center rounded-full border border-[#e0d6bf] bg-[#efe9d9] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#6a5b3f]">
                  Free plan
                </span>
              )}
            </div>

            {authReady && !user && (
              <div className="mt-6 rounded-2xl border border-[#d6d2c6] bg-[#f8f7f1] px-4 py-3 text-sm text-[#6a6459]">
                <Link href="/login" className="font-semibold text-[#1f1d18]">
                  Log in
                </Link>{" "}
                to save your history.
              </div>
            )}

            {authReady && user && saveError && (
              <p className="mt-4 text-xs text-[#8d3b2f]">{saveError}</p>
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
            <div className="w-full max-w-2xl rounded-3xl border border-[#e0d6bf] bg-[#efe9d9] p-6 shadow-[0_22px_70px_rgba(27,24,19,0.2)] transition-all duration-200 ease-out animate-fade-up">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#1f1d18]">
                    Edit feedback helps you understand why a result changed.
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#6a5b3f]">
                    Unlock edit recheck + what changed
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[#b9b4a6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f4a40] transition hover:border-[#8f8a7c]"
                  onClick={() => setUpgradeIntent(null)}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/pricing"
                  className="rounded-full bg-[#1f2a1f] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f6f5ef] transition hover:bg-[#2b3a2b]"
                >
                  Upgrade to Starter
                </Link>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-[#b9b4a6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f4a40]"
              onClick={() => startEditFromSnapshot(latestSnapshot)}
            >
              Try another edit
            </button>
          </div>
        )}

        <footer
          className="mt-auto pt-12 text-xs uppercase tracking-[0.3em] text-[#8a8479] opacity-0 animate-fade-in"
          style={{ animationDelay: "240ms" }}
        >
          Text is sent to your analysis endpoint.
        </footer>
      </div>
    </main>
  );
}
