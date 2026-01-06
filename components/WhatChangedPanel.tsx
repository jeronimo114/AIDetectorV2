"use client";

import { useState } from "react";

import type { Comparison } from "@/lib/analysis/compare";

type WhatChangedPanelProps = {
  comparison: Comparison;
  parentLabel: string;
};

const renderDelta = (delta: number) => {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta}%`;
};

const blockTone = {
  unchanged: "border-[#d8d6cf] bg-white/85 text-[#4c4b45]",
  modified: "border-[#e2ccc2] bg-[#f0e4de] text-[#6a4033]",
  added: "border-[#cfe0d6] bg-[#e5efe7] text-[#2f4b3a]"
};

export default function WhatChangedPanel({ comparison, parentLabel }: WhatChangedPanelProps) {
  const [showText, setShowText] = useState(false);

  return (
    <section className="mt-8 rounded-3xl border border-[#d8d6cf] bg-white/90 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">What changed</p>
      <p className="mt-2 text-sm text-[#4c4b45]">Compared to {parentLabel}.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#d8d6cf] bg-white/85 p-4 text-sm text-[#4c4b45]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">Verdict delta</p>
          <p className="mt-2 text-sm text-[#1f1f1c]">
            {comparison.verdict.changed
              ? `${comparison.verdict.from} → ${comparison.verdict.to}`
              : "Verdict unchanged"}
          </p>
        </div>
        <div className="rounded-2xl border border-[#d8d6cf] bg-white/85 p-4 text-sm text-[#4c4b45]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            Confidence movement
          </p>
          <p className="mt-2 text-sm text-[#1f1f1c]">
            {Math.round(comparison.confidence.from * 100)}% →{" "}
            {Math.round(comparison.confidence.to * 100)}% ({renderDelta(comparison.confidence.delta)})
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "New signals", items: comparison.signals.added },
          { label: "Removed signals", items: comparison.signals.removed },
          { label: "Unchanged signals", items: comparison.signals.unchanged }
        ].map((section) => (
          <div
            key={section.label}
            className={`rounded-2xl border border-[#d8d6cf] bg-white/85 p-4 text-sm text-[#4c4b45] ${
              section.items.length === 0 ? "opacity-70" : ""
            }`}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">{section.label}</p>
            {section.items.length === 0 ? (
              <p className="mt-2 text-xs text-[#7a7670]">No changes.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-[#1f1f1c]">
                {section.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          type="button"
          className="rounded-full border border-[#c4c1b8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4c4b45]"
          onClick={() => setShowText((prev) => !prev)}
        >
          {showText ? "Hide text changes" : "Show text changes"}
        </button>

        {showText && (
          <div className="mt-4 space-y-3">
            {comparison.textBlocks.map((block, index) => (
              <div
                key={`${block.status}-${index}`}
                className={`rounded-2xl border px-4 py-3 text-sm ${blockTone[block.status]}`}
              >
                <p className="text-xs uppercase tracking-[0.2em]">
                  {block.status}
                </p>
                <p className="mt-2 whitespace-pre-wrap">{block.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
