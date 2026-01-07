"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import LoadingLink from "@/components/LoadingLink";
import JsonLd, { faqSchema } from "@/components/JsonLd";

const FILE_ACCEPT =
  ".txt,.md,.doc,.docx,.pdf,text/plain,text/markdown,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MIN_CHARS = 80;

const LOGOS = [
  "Harvard University",
  "Stanford University",
  "MIT",
  "University of California",
  "Columbia University",
  "University of Oxford",
  "University of Cambridge",
  "Imperial College London",
  "ETH Zurich",
  "Sorbonne University",
  "University of Amsterdam",
  "UCL"
];

const WHAT_YOU_GET = [
  "Confidence score with context.",
  "Clear explanations of signals.",
  "Actionable edits to reduce AI risk.",
  "Track changes and compare drafts."
];

const TESTIMONIALS = [
  {
    quote:
      "Veridict explains why a draft looks risky. That makes revisions feel concrete.",
    name: "Maya R.",
    detail: "Undergraduate, UK"
  },
  {
    quote:
      "The signals list is clear. I can see what to fix without guessing.",
    name: "Jordan K.",
    detail: "Graduate student, US"
  },
  {
    quote:
      "It is calm and direct. I can check a draft before I submit it.",
    name: "Elena P.",
    detail: "Masters student, EU"
  }
];

const TIPS = [
  {
    title: "Vary sentence length",
    detail:
      "Mix shorter and longer sentences so the cadence feels more natural."
  },
  {
    title: "Add personal context",
    detail:
      "Include a concrete detail or example that only you would know."
  },
  {
    title: "Reduce repeated structures",
    detail:
      "Avoid repeating the same transition or sentence pattern across paragraphs."
  },
  {
    title: "Use natural transitions",
    detail:
      "Connect ideas with simple, human phrasing instead of rigid structure."
  }
];

const PREVIEW_SIGNALS = [
  "Uniform sentence cadence",
  "Limited idiomatic variation",
  "Low burstiness across paragraphs"
];

const FAQS = [
  {
    question: "How accurate is AI detection?",
    answer:
      "AI detection tools analyze patterns in writing style, not the actual source. Veridict shows you which signals are being detected and their confidence levels, so you can understand what's being flagged and make informed revisions. No detector is 100% accurate, which is why we focus on transparency over verdicts."
  },
  {
    question: "Will my essay be flagged if I used Grammarly or spell-check?",
    answer:
      "Grammar tools and spell-checkers generally don't trigger AI detection because they correct errors rather than generate new content. However, AI-powered rewriting tools that restructure sentences can sometimes create patterns that detectors flag. Veridict helps you identify these patterns before submission."
  },
  {
    question: "How do I reduce AI detection signals in my writing?",
    answer:
      "Focus on varying sentence length, adding personal examples and concrete details, using natural transitions, and avoiding repetitive structures. Veridict's signal breakdown shows exactly which patterns are being detected, so you can target your revisions effectively."
  },
  {
    question: "Is my text stored or shared?",
    answer:
      "Your text is processed securely and stored only in your account history so you can track revisions. We never share your content with third parties or use it for training. You can delete your history at any time from your dashboard."
  },
  {
    question: "What's the difference between Veridict and other AI detectors?",
    answer:
      "Most detectors give you a verdict and leave you guessing. Veridict explains the signals behind the score, shows how edits change your results, and helps you revise with clarity. We focus on education and improvement, not accusation."
  }
];

type ImagePromptCardProps = {
  title: string;
  prompt: string;
  className?: string;
};

const ImagePromptCard = ({ title, prompt, className }: ImagePromptCardProps) => (
  <div
    className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#d8d6cf] bg-[#f3f3ef] p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] ${
      className ?? ""
    }`}
  >
    <div className="absolute -top-16 right-6 h-36 w-36 rounded-full bg-white/70 blur-2xl" />
    <div className="absolute bottom-6 left-6 h-16 w-16 rounded-full border border-white/60" />
    <div className="relative flex h-full flex-col">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">{title}</p>
      <p className="mt-3 text-sm text-[#4c4b45]">Image prompt: {prompt}</p>
      <div className="mt-auto grid grid-cols-3 gap-3">
        <div className="h-16 rounded-2xl border border-[#d8d6cf] bg-white/70" />
        <div className="h-16 rounded-2xl border border-[#d8d6cf] bg-white/70" />
        <div className="h-16 rounded-2xl border border-[#d8d6cf] bg-white/70" />
      </div>
    </div>
  </div>
);

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.replace(/[^a-zA-Z]/g, "")[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function HomePage() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileNote, setFileNote] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showPreviewResults, setShowPreviewResults] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charCount = text.length;
  const canPreview = charCount >= MIN_CHARS;

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName(null);
      setFileNote(null);
      setFileError(null);
      return;
    }

    setFileName(file.name);
    setFileNote(null);
    setFileError(null);
    setPreviewError(null);

    const isTextFile =
      file.type.startsWith("text/") ||
      file.name.toLowerCase().endsWith(".txt") ||
      file.name.toLowerCase().endsWith(".md");

    if (isTextFile) {
      setIsFileLoading(true);
      try {
        const fileText = await file.text();
        setText(fileText);
        setFileNote("Text loaded from file.");
      } catch {
        setFileError("We could not read that file.");
      } finally {
        setIsFileLoading(false);
      }
      return;
    }

    setFileNote("File attached. We will parse it after signup.");
  };

  const handlePreview = () => {
    if (!canPreview) {
      setPreviewError(`Paste at least ${MIN_CHARS} characters to run a preview.`);
      return;
    }
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }
    setPreviewError(null);
    setShowGate(false);
    setIsPreviewing(true);
    setShowPreviewResults(false);
    previewTimerRef.current = setTimeout(() => {
      setIsPreviewing(false);
      setShowPreviewResults(true);
      setShowGate(true);
    }, 1800);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4]">
      {isPreviewing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#f7f7f4]/90 backdrop-blur">
          <div className="w-full max-w-md px-6 text-center" role="status" aria-live="polite">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              Running preview
            </p>
            <p className="mt-3 text-lg font-semibold text-[#1f1f1c]">
              Simulating detection...
            </p>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#d8d6cf]">
              <div className="h-full w-2/3 rounded-full bg-[#2f3e4e] animate-[loading-bar_2.4s_ease-in-out_infinite]" />
            </div>
            <p className="mt-4 text-xs text-[#7a7670]">
              Preview mode is simulated. Create an account for a full check.
            </p>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-[#e6ecf1] opacity-70 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#edf2f5] opacity-70 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1080px] px-6 pb-24 pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              Veridict
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-[#1f1f1c]">
              AI Writing Detector for Students
            </h1>
            <p className="mt-2 text-xl font-medium text-[#3d3d38]">
              Check your work before you submit it.
            </p>
            <p className="mt-3 text-base text-[#4c4b45]">
              See what AI detectors see, then revise with clarity. Get actionable
              signals to reduce false positives on Turnitin and other checkers.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <LoadingLink
                href="/signup?redirectedFrom=/detector"
                className="rounded-full bg-[#2f3e4e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] shadow-[0_10px_28px_rgba(31,42,54,0.2)] transition hover:bg-[#3b4d60]"
              >
                Create Free Account
              </LoadingLink>
              <LoadingLink
                href="/pricing"
                className="rounded-full border border-[#c9d5de] bg-[#edf2f5] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#2f3e4e] transition hover:border-[#b6c6d2]"
              >
                See Pricing
              </LoadingLink>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              Signals over accusations. Probability over certainty.
            </p>
          </div>

          <ImagePromptCard
            title="Hero visual"
            prompt="student using laptop calmly"
            className="min-h-[260px] lg:min-h-[320px]"
          />
        </section>

        <section className="mt-16 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold text-[#1f1f1c]">
              What You Get
            </h2>
            <p className="mt-3 text-sm text-[#4c4b45]">
              Clear signals and calm guidance for every draft.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#4c4b45]">
              {WHAT_YOU_GET.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2f3e4e]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <ImagePromptCard
            title="Interface explanation"
            prompt="interface explanation"
            className="min-h-[220px]"
          />
        </section>

        <section className="mt-16 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <ImagePromptCard
            title="Student context"
            prompt="university students"
            className="min-h-[220px]"
          />
          <div>
            <h2 className="text-2xl font-semibold text-[#1f1f1c]">
              Trusted by Students Across the World
            </h2>
            <p className="mt-3 text-sm text-[#4c4b45]">
              Students in the United States and Europe check drafts before
              submission and learn how their writing is perceived.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-[#4c4b45] sm:grid-cols-2 lg:grid-cols-4">
              {LOGOS.map((logo) => (
                <div
                  key={logo}
                  className="rounded-2xl border border-[#d8d6cf] bg-[#f7f7f4] px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-[#7a7670]"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div>
            <h2 className="text-2xl font-semibold text-[#1f1f1c]">
              Try a Preview
            </h2>
            <p className="mt-3 text-sm text-[#4c4b45]">
              Paste a paragraph to see a sample detection. Preview mode shows
              the report layout before you create an account.
            </p>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-[#d8d6cf] bg-white/90 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                    Preview input
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#1f1f1c]">
                    Paste text or upload a document.
                  </p>
                </div>
                <span className="rounded-full border border-[#d8dde2] bg-[#eef1f3] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#4a5560]">
                  Preview
                </span>
              </div>

              <label className="mt-4 block text-sm text-[#4c4b45]">
                Text input
                <textarea
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    setPreviewError(null);
                  }}
                  placeholder="Paste a paragraph from your assignment."
                  className="mt-2 min-h-[160px] w-full rounded-2xl border border-[#d8d6cf] bg-white/95 p-4 text-sm text-[#1f1f1c] focus:border-[#8fa3b5] focus:outline-none focus:ring-4 focus:ring-[#d7e1ea]"
                />
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#7a7670]">
                <span>{`${charCount} characters`}</span>
                <span>Minimum {MIN_CHARS} characters required.</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-full border border-[#c9d5de] bg-[#edf2f5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f3e4e] transition hover:border-[#b6c6d2]">
                  Upload document
                  <input
                    type="file"
                    accept={FILE_ACCEPT}
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                {isFileLoading && (
                  <span className="inline-flex items-center gap-2 text-xs text-[#4a5560]">
                    <span className="h-3 w-3 rounded-full border-2 border-[#4a5560]/40 border-t-[#4a5560] animate-spin" />
                    Loading file
                  </span>
                )}
                {fileName && !isFileLoading && (
                  <span className="text-xs text-[#4a5560]">{fileName}</span>
                )}
              </div>

              {fileNote && (
                <p className="mt-2 text-xs text-[#4a5560]">{fileNote}</p>
              )}
              {fileError && (
                <p className="mt-2 text-xs text-[#6a4033]">{fileError}</p>
              )}

              {previewError && (
                <p className="mt-4 text-xs text-[#6a4033]">{previewError}</p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="inline-flex items-center justify-center rounded-full bg-[#2f3e4e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#3b4d60] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canPreview || isPreviewing}
                >
                  {isPreviewing ? "Running..." : "Run Preview"}
                </button>
                <span className="text-xs text-[#7a7670]">
                  Preview only. Create an account to run the full detector.
                </span>
              </div>
            </div>

            <div className="relative rounded-3xl border border-[#d8d6cf] bg-white/90 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
              <div className={showPreviewResults ? "blur-sm" : ""}>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  Sample report
                </p>
                <p className="mt-2 text-xs text-[#7a7670]">
                  Image prompt: AI document checker
                </p>
                <p className="mt-3 text-2xl font-semibold text-[#1f1f1c]">
                  Verdict: Unclear
                </p>
                <p className="mt-2 text-sm text-[#4c4b45]">
                  The confidence score reflects probability, not certainty.
                </p>
                <div className="mt-4 rounded-2xl border border-[#d8d6cf] bg-[#f7f7f4] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                    Detected signals
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[#4c4b45]">
                    {PREVIEW_SIGNALS.map((signal) => (
                      <li key={signal} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2f3e4e]" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 rounded-2xl border border-[#d8d6cf] bg-[#f7f7f4] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                    Next steps
                  </p>
                  <p className="mt-2 text-sm text-[#4c4b45]">
                    You may want to review sentence variety and add a personal detail.
                  </p>
                </div>
              </div>
              {showPreviewResults && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/60 text-center">
                  <div className="mx-auto max-w-[220px] rounded-2xl border border-[#d8d6cf] bg-white/90 p-4 text-xs uppercase tracking-[0.2em] text-[#4c4b45]">
                    Create an account to view the full report.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                Improve naturalness
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[#1f1f1c]">
                Reduce AI risk signals with small edits.
              </h2>
            </div>
            <LoadingLink
              href="/signup?redirectedFrom=/detector"
              className="rounded-full border border-[#2f3e4e] bg-[#2f3e4e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#27323f]"
            >
              Start a Real Check
            </LoadingLink>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {TIPS.map((tip) => (
              <div
                key={tip.title}
                className="rounded-3xl border border-[#d8d6cf] bg-white/80 p-5 shadow-[0_16px_40px_rgba(27,24,19,0.06)] backdrop-blur"
              >
                <p className="text-sm font-semibold text-[#1f1f1c]">
                  {tip.title}
                </p>
                <p className="mt-2 text-sm text-[#4c4b45]">{tip.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            Student feedback
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[#1f1f1c]">
            Calm clarity before submission.
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.name}
                className="rounded-3xl border border-[#d8d6cf] bg-white/85 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(27,24,19,0.16)]"
              >
                <p className="text-sm text-[#1f1f1c]">"{item.quote}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8d6cf] bg-[#f3f3ef] text-xs font-semibold uppercase tracking-[0.2em] text-[#4c4b45]">
                    {getInitials(item.name)}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-[#7a7670]">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <JsonLd data={faqSchema(FAQS)} />
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            Common questions
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[#1f1f1c]">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-[#d8d6cf] bg-white/85 shadow-[0_8px_30px_rgba(27,24,19,0.06)]"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-sm font-medium text-[#1f1f1c] [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="text-[#7a7670] transition-transform group-open:rotate-180">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-[#ebe7de] px-6 py-4 text-sm text-[#4c4b45]">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16 grid items-center gap-10 rounded-3xl border border-[#d8d6cf] bg-[#f3f3ef] p-8 shadow-[0_18px_60px_rgba(27,24,19,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              Full detection
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#1f1f1c]">
              Run the full detector and save every draft.
            </h2>
            <p className="mt-2 text-sm text-[#4c4b45]">
              Explanations over conclusions. Guidance over punishment.
            </p>
            <div className="mt-6">
              <LoadingLink
                href="/signup?redirectedFrom=/detector"
                className="rounded-full bg-[#2f3e4e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#3b4d60]"
              >
                Create Account
              </LoadingLink>
            </div>
          </div>
          <ImagePromptCard
            title="CTA visual"
            prompt="student with paper and AI assistant"
            className="min-h-[200px] bg-white/70"
          />
        </section>
      </div>

      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[#d8d6cf] bg-white/95 p-6 shadow-[0_22px_70px_rgba(27,24,19,0.2)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              Create an account
            </p>
            <h3 className="mt-3 text-xl font-semibold text-[#1f1f1c]">
              Run the full detector and save your results.
            </h3>
            <p className="mt-2 text-sm text-[#4c4b45]">
              We keep your text private and store each run so you can compare
              revisions. We will send you to the full detector after signup.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <LoadingLink
                href="/signup?redirectedFrom=/detector"
                className="rounded-full bg-[#2f3e4e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#3b4d60]"
              >
                Create account
              </LoadingLink>
              <LoadingLink
                href="/login?redirectedFrom=/detector"
                className="rounded-full border border-[#c9d5de] bg-[#edf2f5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#2f3e4e] transition hover:border-[#b6c6d2]"
              >
                Log in
              </LoadingLink>
              <button
                type="button"
                className="text-xs uppercase tracking-[0.3em] text-[#7a7670]"
                onClick={() => setShowGate(false)}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
