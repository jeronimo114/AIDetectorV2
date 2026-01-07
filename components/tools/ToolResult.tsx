"use client";

import type { DetectionResponse, TransformationResponse } from "@/lib/tools/types";

type VerdictTone = "positive" | "neutral" | "caution";

const toneStyles: Record<VerdictTone, { pill: string; bar: string; text: string; bg: string }> = {
  positive: {
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    text: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  neutral: {
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    bar: "bg-gradient-to-r from-amber-500 to-amber-400",
    text: "text-amber-600",
    bg: "bg-amber-50"
  },
  caution: {
    pill: "bg-red-50 text-red-700 border border-red-200",
    bar: "bg-gradient-to-r from-red-500 to-red-400",
    text: "text-red-600",
    bg: "bg-red-50"
  }
};

const verdictToneMap: Record<string, VerdictTone> = {
  "Likely AI": "caution",
  Unclear: "neutral",
  "Likely Human": "positive"
};

const IMPROVEMENT_TIPS = [
  "Vary sentence length to reduce uniform cadence.",
  "Add personal context or a concrete detail.",
  "Reduce repeated structures and transitions.",
  "Use natural transitions between ideas."
];

const normalizeSignal = (signal: string) => {
  const trimmed = signal.trim();
  if (!trimmed) return "this pattern";
  if (trimmed.length > 1 && trimmed[0] === trimmed[0].toUpperCase() && trimmed[1] === trimmed[1].toUpperCase()) {
    return trimmed;
  }
  return trimmed[0].toLowerCase() + trimmed.slice(1);
};

const buildSignalDetails = (signal: string, useRawSignal = false) => ({
  meaning: useRawSignal ? signal : `Your text shows ${normalizeSignal(signal)}.`,
  why: "This pattern is commonly associated with AI-assisted or highly uniform writing.",
  impact: "It influences the confidence score alongside the other signals."
});

interface DetectionResultProps {
  result: DetectionResponse;
  locked?: boolean;
}

export function DetectionResult({ result, locked }: DetectionResultProps) {
  const tone = verdictToneMap[result.verdict] || "neutral";
  const confidencePercent = Math.round(Math.min(Math.max(result.confidence, 0), 1) * 100);
  const signals = (result.signals ?? []).filter(Boolean).length > 0
    ? result.signals!.filter(Boolean)
    : result.breakdown.filter(Boolean);
  const usesBreakdown = !result.signals || result.signals.length === 0;

  const summaryLine = result.verdict === "Likely AI"
    ? "Signals suggest patterns commonly associated with AI-generated text."
    : result.verdict === "Likely Human"
    ? "Signals suggest patterns commonly associated with human writing."
    : "Signals suggest a mixed pattern across common detectors.";

  return (
    <div className={locked ? "pointer-events-none blur-sm" : ""}>
      {/* Verdict & Confidence */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Verdict Summary
          </p>
          <div className={`mt-3 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${toneStyles[tone].pill}`}>
            <span className={`mr-2 h-2 w-2 rounded-full ${tone === 'positive' ? 'bg-emerald-500' : tone === 'caution' ? 'bg-red-500' : 'bg-amber-500'}`} />
            {result.verdict}
          </div>
          <p className="mt-3 text-sm text-gray-600">{summaryLine}</p>
        </div>
        <div className={`rounded-xl border p-4 ${toneStyles[tone].bg} border-transparent`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium uppercase tracking-wider text-gray-500">Confidence</span>
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-[10px] text-gray-400 cursor-help"
              title="The confidence score reflects probability, not certainty."
            >
              ?
            </span>
          </div>
          <p className={`mt-3 text-4xl font-bold ${toneStyles[tone].text}`}>
            {confidencePercent}%
          </p>
          <p className="mt-1 text-xs text-gray-500">Probability, not certainty.</p>
          {result.model && (
            <p className="mt-2 text-xs text-gray-400">Model: {result.model}</p>
          )}
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mt-6 h-3 w-full rounded-full bg-gray-100">
        <div
          className={`h-3 rounded-full transition-all ${toneStyles[tone].bar}`}
          style={{ width: `${confidencePercent}%` }}
        />
      </div>

      {/* Detected Signals */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Detected Signals
          </span>
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-[10px] text-gray-400 cursor-help"
            title="Each signal includes what it means, why it matters, and how it affects the score."
          >
            ?
          </span>
        </div>
        {signals.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {signals.map((signal, index) => {
              const details = buildSignalDetails(signal, usesBreakdown);
              return (
                <li key={`${signal}-${index}`} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <details className="group">
                    <summary className="flex cursor-pointer items-start justify-between gap-3 p-4 hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
                      <div className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{signal}</span>
                      </div>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all group-open:border-orange-200 group-open:bg-orange-50 group-open:text-orange-500">
                        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 transition-transform group-open:rotate-180">
                          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </summary>
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium text-gray-900">What it means:</span> {details.meaning}</p>
                      <p><span className="font-medium text-gray-900">Why it matters:</span> {details.why}</p>
                      <p><span className="font-medium text-gray-900">How it affects the score:</span> {details.impact}</p>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            No signal list was returned. Review the verdict summary.
          </div>
        )}
      </div>

      {/* Improvement Tips */}
      <div className="mt-8 rounded-xl border border-orange-100 bg-orange-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">
          Suggestions to Improve
        </p>
        <ul className="mt-3 space-y-2">
          {IMPROVEMENT_TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-3">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 flex-shrink-0 text-orange-500 mt-0.5">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm text-gray-700">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface TransformationResultProps {
  result: TransformationResponse;
  locked?: boolean;
}

export function TransformationResult({ result, locked }: TransformationResultProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.transformedText);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = result.transformedText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className={locked ? "pointer-events-none blur-sm" : ""}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Humanized Result
        </p>
        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path d="M8 3H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3M8 3v4a2 2 0 002 2h4M8 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copy
        </button>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-700">Transformation Complete</p>
            <p className="mt-1 text-xs text-emerald-600">Your text has been humanized</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {result.transformedText}
        </p>
      </div>

      {result.changes && result.changes.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">
            Changes Made
          </p>
          <ul className="space-y-2">
            {result.changes.map((change, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
                {change}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
