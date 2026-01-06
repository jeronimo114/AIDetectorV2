"use client";

import { useState, type ChangeEvent } from "react";

import LoadingLink from "@/components/LoadingLink";

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
    detail: "Student, EU"
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

export default function HomePage() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileNote, setFileNote] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const charCount = text.length;
  const hasInput = charCount > 0 || !!fileName;

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
    if (!hasInput) {
      setPreviewError("Add text or attach a document to run a preview.");
      return;
    }
    setPreviewError(null);
    setShowGate(true);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-[#e6ecf1] opacity-70 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#edf2f5] opacity-70 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1060px] px-6 pb-20 pt-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              Veridict for students
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-[#1f1f1c]">
              Check your work before you submit it.
            </h1>
            <p className="mt-4 text-base text-[#4c4b45]">
              Veridict explains AI detection signals with calm, direct guidance.
              It provides probabilities and practical edits so you can decide
              what to improve.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <LoadingLink
                href="/signup?redirectedFrom=/detector"
                className="rounded-full bg-[#2f3e4e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] shadow-[0_10px_28px_rgba(31,42,54,0.2)] transition hover:bg-[#3b4d60]"
              >
                Create free account
              </LoadingLink>
              <LoadingLink
                href="/pricing"
                className="rounded-full border border-[#c9d5de] bg-[#edf2f5] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#2f3e4e] transition hover:border-[#b6c6d2]"
              >
                See pricing
              </LoadingLink>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              Signals over accusations. Probability over certainty.
            </p>
          </div>

          <div className="rounded-3xl border border-[#d8d6cf] bg-white/90 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              What you get
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[#4c4b45]">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2f3e4e]" />
                <span>Verdict with confidence score and clear context.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2f3e4e]" />
                <span>Readable signals that explain why the score moved.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2f3e4e]" />
                <span>Actionable edits to improve natural variation.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2f3e4e]" />
                <span>History to compare drafts and track changes.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-[#d8d6cf] bg-white/70 p-6 shadow-[0_14px_50px_rgba(27,24,19,0.06)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            Designed for students across the world
          </p>
          <div className="mt-4 grid gap-3 text-sm text-[#4c4b45] sm:grid-cols-2 lg:grid-cols-4">
            {LOGOS.map((logo) => (
              <div
                key={logo}
                className="rounded-2xl border border-[#d8d6cf] bg-[#f7f7f4] px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-[#7a7670]"
              >
                {logo}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[#d8d6cf] bg-white/90 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  Detector preview
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
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste a paragraph from your assignment."
                className="mt-2 min-h-[160px] w-full rounded-2xl border border-[#d8d6cf] bg-white/95 p-4 text-sm text-[#1f1f1c] focus:border-[#8fa3b5] focus:outline-none focus:ring-4 focus:ring-[#d7e1ea]"
              />
            </label>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#7a7670]">
              <span>{`${charCount} characters`}</span>
              <span>Minimum {MIN_CHARS} characters recommended.</span>
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
                <span className="text-xs text-[#4a5560]">
                  {fileName}
                </span>
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
                className="inline-flex items-center justify-center rounded-full bg-[#2f3e4e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#3b4d60]"
              >
                Run preview
              </button>
              <span className="text-xs text-[#7a7670]">
                Preview only. Create an account to run the full detector.
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d8d6cf] bg-white/90 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
              Sample report
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
        </section>

        <section className="mt-12">
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
              Start a real check
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

        <section className="mt-12">
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
                className="rounded-3xl border border-[#d8d6cf] bg-white/85 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur"
              >
                <p className="text-sm text-[#1f1f1c]">"{item.quote}"</p>
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-[#7a7670]">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#d8d6cf] bg-[#f3f3ef] p-8 shadow-[0_18px_60px_rgba(27,24,19,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                Ready for a full check?
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[#1f1f1c]">
                Run the full detector and save every draft.
              </h2>
              <p className="mt-2 text-sm text-[#4c4b45]">
                Explanations over conclusions. Guidance over punishment.
              </p>
            </div>
            <LoadingLink
              href="/signup?redirectedFrom=/detector"
              className="rounded-full bg-[#2f3e4e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#3b4d60]"
            >
              Create account
            </LoadingLink>
          </div>
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
              revisions. This preview does not analyze content.
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
