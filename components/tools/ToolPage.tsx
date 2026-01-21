"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { User } from "@supabase/supabase-js";

import LoadingLink from "@/components/LoadingLink";
import TipRotator from "@/components/TipRotator";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolCTA from "@/components/tools/ToolCTA";
import RelatedTools from "@/components/tools/RelatedTools";
import { DetectionResult, TransformationResult, CountResult, GenerationResult, ConversionResult } from "@/components/tools/ToolResult";
import type { ToolConfig, DetectionResponse, TransformationResponse, CountResponse, GenerationResponse, ConversionResponse, ToolResponse } from "@/lib/tools/types";
import { getRelatedTools } from "@/lib/tools/config";
import { convertPdfToMarkdown } from "@/lib/tools/pdf";
import { convertDocxToMarkdown } from "@/lib/tools/docx";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatNumber } from "@/lib/format";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TIMEOUT_MS = 20000;
const TEXT_FILE_ACCEPT = ".txt,.md,text/plain,text/markdown";
const PDF_FILE_ACCEPT = ".pdf,application/pdf";
const DOCX_FILE_ACCEPT = ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_DOCX_BYTES = 10 * 1024 * 1024;

// Next.js requires literal strings for env vars at build time
function getWebhookUrl(envKey: string): string {
  if (envKey === "NEXT_PUBLIC_N8N_WEBHOOK_URL") {
    return process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? "";
  }
  if (envKey === "NEXT_PUBLIC_N8N_HUMANIZER_WEBHOOK_URL") {
    return process.env.NEXT_PUBLIC_N8N_HUMANIZER_WEBHOOK_URL ?? "";
  }
  if (envKey === "NEXT_PUBLIC_N8N_OUTLINE_WEBHOOK_URL") {
    return process.env.NEXT_PUBLIC_N8N_OUTLINE_WEBHOOK_URL ?? "";
  }
  if (envKey === "NEXT_PUBLIC_N8N_THESIS_WEBHOOK_URL") {
    return process.env.NEXT_PUBLIC_N8N_THESIS_WEBHOOK_URL ?? "";
  }
  // Empty string for utility tools (word counter, etc.) - they compute locally
  return "";
}

// Calculate text statistics for count tools
function calculateTextStats(text: string): CountResponse {
  const trimmed = text.trim();

  // Word count
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;

  // Character counts
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // Sentence count (split by .!? followed by space or end)
  const sentences = trimmed.length === 0 ? 0 : (trimmed.match(/[.!?]+(?:\s|$)/g) || []).length || (trimmed.length > 0 ? 1 : 0);

  // Paragraph count (split by double newlines or single newlines)
  const paragraphs = trimmed.length === 0 ? 0 : trimmed.split(/\n\s*\n|\n/).filter(p => p.trim().length > 0).length;

  // Reading time (average 200 wpm)
  const readingMinutes = Math.ceil(words / 200);
  const readingTime = readingMinutes < 1 ? "< 1 min" : `${readingMinutes} min`;

  // Speaking time (average 150 wpm)
  const speakingMinutes = Math.ceil(words / 150);
  const speakingTime = speakingMinutes < 1 ? "< 1 min" : `${speakingMinutes} min`;

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTime,
    speakingTime
  };
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const DEMO_DETECTION: DetectionResponse = {
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

const DEMO_TRANSFORMATION: TransformationResponse = {
  originalText: "",
  transformedText: "Your humanized text will appear here after processing. Sign up to unlock the full transformation and save your results.",
  changes: ["Varied sentence structure", "Added natural transitions", "Reduced repetitive patterns"]
};

const DEMO_GENERATION: GenerationResponse = {
  output: "Your generated content will appear here. Sign up to unlock full generation capabilities and save your results.",
  sections: ["Introduction", "Body", "Conclusion"]
};

interface ToolPageProps {
  config: ToolConfig;
}

function isDetectionResponse(value: unknown): value is DetectionResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as DetectionResponse;
  const hasVerdict = data.verdict === "Likely AI" || data.verdict === "Unclear" || data.verdict === "Likely Human";
  const hasConfidence = typeof data.confidence === "number";
  const hasBreakdown = Array.isArray(data.breakdown);
  return hasVerdict && hasConfidence && hasBreakdown;
}

function isTransformationResponse(value: unknown): value is TransformationResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as TransformationResponse;
  return typeof data.transformedText === "string";
}

function isCountResponse(value: unknown): value is CountResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as CountResponse;
  return typeof data.words === "number" && typeof data.characters === "number";
}

function isGenerationResponse(value: unknown): value is GenerationResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as GenerationResponse;
  return typeof data.output === "string";
}

function isConversionResponse(value: unknown): value is ConversionResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as ConversionResponse;
  return typeof data.markdown === "string" && typeof data.pages === "number";
}

export default function ToolPage({ config }: ToolPageProps) {
  useScrollAnimation();

  const supabase = getSupabaseBrowserClient();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<ToolResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showLockedResults, setShowLockedResults] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const authGateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const relatedTools = getRelatedTools(config.slug);
  const webhookUrl = getWebhookUrl(config.webhookEnvKey);
  const isCountTool = config.result.type === "count";
  const isConversionTool = config.result.type === "conversion";
  const isPdfTool = config.slug === "pdf-to-md";
  const isDocxTool = config.slug === "docx-to-md";
  const isLocalTool = isCountTool || isConversionTool;
  const isWebhookMissing = !isLocalTool && webhookUrl.length === 0;
  const maxFileBytes = isPdfTool ? MAX_PDF_BYTES : MAX_DOCX_BYTES;

  useEffect(() => {
    let isMounted = true;

    const refreshUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (error) {
        setUser(null);
      } else {
        setUser(data.user ?? null);
      }
      setAuthReady(true);
    };

    void refreshUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      if (!isMounted) return;
      void refreshUser();
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
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
        .in("key", ["enable_tips"]);

      if (!isMounted || !data) return;

      const map = new Map(data.map((row) => [row.key, row.value]));
      const tips = map.get("enable_tips");
      if (typeof tips === "boolean") {
        setTipsEnabled(tips);
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const trimmed = text.trim();
  const charCount = text.length;
  const fileTooLarge = isConversionTool && uploadedFile !== null && uploadedFile.size > maxFileBytes;
  const underMin = isConversionTool ? !uploadedFile : trimmed.length < config.ui.minChars;
  const exceedsMax = isConversionTool ? fileTooLarge : charCount > config.ui.maxChars;

  const canAnalyze = isConversionTool
    ? !isLoading && !isFileLoading && !!uploadedFile && !fileTooLarge
    : !isLoading && !isFileLoading && !exceedsMax && !underMin && !isWebhookMissing;

  const fileAccept = isPdfTool ? PDF_FILE_ACCEPT : isDocxTool ? DOCX_FILE_ACCEPT : TEXT_FILE_ACCEPT;
  const fileHint = isPdfTool ? "Upload .pdf" : isDocxTool ? "Upload .docx" : "Upload .txt or .md";
  const inputTitle = isPdfTool ? "Your PDF" : isDocxTool ? "Your DOCX" : "Your Text";
  const headerStat = isConversionTool
    ? uploadedFile
      ? `${formatFileSize(uploadedFile.size)} / ${formatFileSize(maxFileBytes)}`
      : `Max ${formatFileSize(maxFileBytes)}`
    : `${formatNumber(charCount)}/${formatNumber(config.ui.maxChars)}`;
  const fileTypeLabel = isPdfTool ? "PDF" : "DOCX";
  const helperText = isConversionTool
    ? fileTooLarge
      ? `File is too large. Max ${formatFileSize(maxFileBytes)}.`
      : uploadedFile
        ? "Ready to convert."
        : `Upload a ${fileTypeLabel} (max ${formatFileSize(maxFileBytes)}).`
    : exceedsMax
      ? `Maximum ${formatNumber(config.ui.maxChars)} characters exceeded.`
      : `Minimum ${config.ui.minChars} characters to analyze.`;

  const handleClear = () => {
    setText("");
    setResult(null);
    setRequestError(null);
    setFileError(null);
    setUploadedFileName(null);
    setUploadedFile(null);
    setShowAuthGate(false);
    setShowLockedResults(false);
  };

  const focusTextarea = () => {
    if (isConversionTool) {
      fileInputRef.current?.click();
      return;
    }
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleAnalyze = async () => {
    if (isLoading || isFileLoading) return;

    if (isConversionTool) {
      if (!uploadedFile) {
        setRequestError(`Please upload a ${fileTypeLabel} to convert.`);
        return;
      }

      if (fileTooLarge) {
        setRequestError(`Please upload a ${fileTypeLabel} under ${formatFileSize(maxFileBytes)}.`);
        return;
      }

      setIsLoading(true);
      setRequestError(null);
      setFileError(null);
      setResult(null);

      try {
        const conversion = isPdfTool
          ? await convertPdfToMarkdown(uploadedFile)
          : await convertDocxToMarkdown(uploadedFile);
        setResult(conversion);
      } catch (error) {
        const errorMsg = `We could not convert that ${fileTypeLabel}.`;
        if (error instanceof Error) {
          setRequestError(error.message || errorMsg);
        } else {
          setRequestError(errorMsg);
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (exceedsMax) {
      setRequestError(`Please keep the text under ${config.ui.maxChars} characters.`);
      return;
    }

    if (underMin) {
      setRequestError(`Please enter at least ${config.ui.minChars} characters to check.`);
      return;
    }

    // Count tools compute locally - no auth needed, no API call
    if (isCountTool) {
      setIsLoading(true);
      setRequestError(null);
      setFileError(null);
      setResult(null);

      // Small delay for UX
      setTimeout(() => {
        const countResult = calculateTextStats(text);
        setResult(countResult);
        setIsLoading(false);
      }, 300);
      return;
    }

    if (!user) {
      if (authGateTimerRef.current) {
        clearTimeout(authGateTimerRef.current);
      }
      setIsLoading(true);
      setRequestError(null);
      setFileError(null);
      setResult(null);
      setShowAuthGate(false);
      setShowLockedResults(false);

      authGateTimerRef.current = setTimeout(() => {
        let demoResult: ToolResponse;
        if (config.result.type === "detection") {
          demoResult = DEMO_DETECTION;
        } else if (config.result.type === "generation") {
          demoResult = DEMO_GENERATION;
        } else {
          demoResult = { ...DEMO_TRANSFORMATION, originalText: trimmed };
        }
        setResult(demoResult);
        setShowLockedResults(true);
        setShowAuthGate(true);
        setIsLoading(false);
      }, 1600);
      return;
    }

    if (isWebhookMissing) {
      setRequestError("Analysis endpoint is not configured.");
      return;
    }

    setIsLoading(true);
    setRequestError(null);
    setFileError(null);
    setResult(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          meta: {
            source: `veridict-tools-${config.slug}`,
            timestamp: new Date().toISOString()
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      const data = (await response.json()) as unknown;

      if (config.result.type === "detection" && isDetectionResponse(data)) {
        setResult(data);
      } else if (config.result.type === "transformation" && isTransformationResponse(data)) {
        setResult({ ...data, originalText: trimmed });
      } else if (config.result.type === "generation" && isGenerationResponse(data)) {
        setResult(data);
      } else {
        setRequestError("Unexpected response format. Please try again.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setRequestError(`The request timed out. Please try again.`);
      } else if (error instanceof Error) {
        setRequestError(error.message || "Something went wrong. Please try again.");
      } else {
        setRequestError("Something went wrong. Please try again.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsFileLoading(true);
    setFileError(null);

    try {
      if (isConversionTool) {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");
        const isValidFile = isPdfTool ? isPdf : isDocxTool ? isDocx : false;
        if (!isValidFile) {
          setUploadedFileName(null);
          setUploadedFile(null);
          setFileError(`Please upload a ${fileTypeLabel} file.`);
          return;
        }
        if (file.size > maxFileBytes) {
          setUploadedFileName(null);
          setUploadedFile(null);
          setFileError(`${fileTypeLabel} exceeds ${formatFileSize(maxFileBytes)}.`);
          return;
        }
        setUploadedFile(file);
        setUploadedFileName(file.name);
        setRequestError(null);
        setResult(null);
        setText("");
        return;
      }

      const content = await file.text();
      if (content.length > config.ui.maxChars) {
        setUploadedFileName(null);
        setFileError(`File has ${content.length} characters, which exceeds the ${config.ui.maxChars} character limit.`);
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

  // Local tools are free - no locking
  const lockResults = showLockedResults && !user && !isLocalTool;

  return (
    <main className="relative min-h-screen bg-gray-50">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="w-full max-w-md px-6 text-center" role="status" aria-live="polite">
            <div className="relative mx-auto mb-8 h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
              <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-orange-500">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-sm font-medium uppercase tracking-wider text-orange-600">Processing</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{config.ui.buttonLoadingText}</p>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 animate-[loading-bar_2s_ease-in-out_infinite]" />
            </div>
            <p className="mt-4 text-sm text-gray-500">This may take a few seconds.</p>
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-screen w-full max-w-[900px] flex-col px-6 pb-20 pt-10">
        {/* Header */}
        <ToolHeader
          badge={config.ui.badge}
          h1={config.seo.h1}
          subheading={config.seo.subheading}
        />

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-3 opacity-0 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5"
            onClick={focusTextarea}
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="12" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {config.ui.buttonText}
          </button>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            How it works
          </Link>
        </div>

        {/* Input Section */}
        <section
          className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm opacity-0 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-orange-500">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Input</p>
                <p className="text-lg font-semibold text-gray-900">{inputTitle}</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${exceedsMax ? "text-red-500" : "text-gray-400"}`}>
              {headerStat}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>{fileHint}</span>
              {uploadedFileName && (
                <span className="max-w-[200px] truncate rounded-full bg-orange-50 px-3 py-1 text-orange-700" title={uploadedFileName}>
                  {uploadedFileName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={fileAccept}
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isFileLoading}
                aria-busy={isFileLoading}
              >
                {isFileLoading ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    Loading...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                      <path d="M3 16v1a2 2 0 002 2h10a2 2 0 002-2v-1M14 6l-4-4m0 0L6 6m4-4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Choose file
                  </>
                )}
              </button>
            </div>
          </div>

          {fileError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{fileError}</p>
          )}

          {isConversionTool ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
              <p>Upload a {fileTypeLabel} and convert it to clean Markdown in your browser.</p>
              <p className="mt-2 text-xs text-gray-500">The conversion runs locally and does not upload your file.</p>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              className="mt-4 min-h-[260px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-base leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-70 transition-all"
              placeholder={config.ui.placeholder}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setFileError(null);
              }}
              disabled={isLoading}
            />
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className={`text-sm ${exceedsMax ? "text-red-500" : "text-gray-500"}`}>
              {helperText}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {config.ui.buttonLoadingText}
                  </>
                ) : (
                  config.ui.buttonText
                )}
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                onClick={handleClear}
                disabled={isLoading || isFileLoading || (isConversionTool ? !uploadedFile : text.length === 0)}
              >
                Clear
              </button>
            </div>
          </div>
          <TipRotator isActive={isLoading && tipsEnabled} />
        </section>

        {/* Error Messages */}
        {isWebhookMissing && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 opacity-0 animate-fade-in" style={{ animationDelay: "160ms" }}>
            Analysis endpoint is not configured.
          </div>
        )}

        {requestError && !isWebhookMissing && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 opacity-0 animate-fade-in" style={{ animationDelay: "160ms" }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{requestError}</span>
              <button
                type="button"
                className="rounded-lg border border-red-200 bg-white px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <section
            className="relative mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm opacity-0 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            {config.result.type === "detection" && isDetectionResponse(result) && (
              <DetectionResult result={result} locked={lockResults} />
            )}
            {config.result.type === "transformation" && isTransformationResponse(result) && (
              <TransformationResult result={result} locked={lockResults} />
            )}
            {config.result.type === "count" && isCountResponse(result) && (
              <CountResult result={result} locked={lockResults} />
            )}
            {config.result.type === "generation" && isGenerationResponse(result) && (
              <GenerationResult result={result} locked={lockResults} />
            )}
            {config.result.type === "conversion" && isConversionResponse(result) && (
              <ConversionResult result={result} locked={lockResults} />
            )}

            {/* Lock overlay */}
            {lockResults && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm">
                <div className="mx-auto max-w-[300px] rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-lg">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-orange-500">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-gray-900">Create an account</p>
                  <p className="mt-1 text-sm text-gray-600">to view your full report</p>
                  <LoadingLink
                    href={`/signup?redirectedFrom=/tools/${config.slug}`}
                    className="mt-4 block w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
                  >
                    Get Started Free
                  </LoadingLink>
                </div>
              </div>
            )}

            {authReady && !user && !lockResults && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-500">
                  Log in
                </Link>{" "}
                to save your history.
              </div>
            )}
          </section>
        )}

        {/* Auth Gate Modal */}
        {showAuthGate && !user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-6 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-orange-500">
                  <path d="M12 15v2m0-8v4m0 8c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">
                View your full report
              </h3>
              <p className="mt-2 text-gray-600">
                Create an account to unlock detailed signals, save your history, and track revisions over time.
              </p>
              <div className="mt-6 space-y-3">
                <LoadingLink
                  href={`/signup?redirectedFrom=/tools/${config.slug}`}
                  className="block w-full rounded-full bg-orange-500 py-3 text-center text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600"
                >
                  Create Free Account
                </LoadingLink>
                <LoadingLink
                  href={`/login?redirectedFrom=/tools/${config.slug}`}
                  className="block w-full rounded-full border border-gray-200 bg-white py-3 text-center text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                >
                  Already have an account? Log in
                </LoadingLink>
              </div>
              <button
                type="button"
                className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowAuthGate(false)}
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        {/* How it works section */}
        <section
          id="how-it-works"
          className="scroll-fade-up mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">How it works</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Three simple steps</h2>
          <div className="stagger-children mt-6 grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Paste your text", desc: "Enter or upload your content", icon: (
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )},
              { step: "02", title:
                config.result.type === "detection" ? "Review signals" :
                config.result.type === "count" ? "See statistics" :
                config.result.type === "generation" ? "Generate content" :
                config.result.type === "conversion" ? "Convert to Markdown" :
                "Get results",
                desc:
                config.result.type === "detection" ? "See what patterns are detected" :
                config.result.type === "count" ? "View word count, characters & more" :
                config.result.type === "generation" ? "AI creates your content instantly" :
                config.result.type === "conversion" ? "Extract text and structure it as Markdown" :
                "Receive your humanized text",
                icon: (
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )},
              { step: "03", title:
                config.result.type === "detection" ? "Revise & recheck" :
                config.result.type === "count" ? "Use anywhere" :
                config.result.type === "conversion" ? "Download Markdown" :
                "Copy & use",
                desc:
                config.result.type === "detection" ? "Improve and verify your changes" :
                config.result.type === "count" ? "Free to use, no signup required" :
                config.result.type === "conversion" ? "Copy or download the .md file" :
                "Use your improved text",
                icon: (
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  {item.icon}
                </div>
                <span className="mt-4 block text-xs font-bold text-orange-500">{item.step}</span>
                <p className="mt-1 font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <ToolCTA toolSlug={config.slug} />

        {/* Related Tools */}
        <RelatedTools tools={relatedTools} />

        {/* Footer */}
        <footer className="scroll-fade-up mt-auto pt-12 text-center text-sm text-gray-500">
          <p className="font-medium">Signals over accusations · Probability over certainty</p>
        </footer>
      </div>
    </main>
  );
}
