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
  unchanged: "border-[#d6d2c6] bg-white/70 text-[#4f4a40]",
  modified: "border-[#edb8aa] bg-[#f7e8e4] text-[#5a1e14]",
  added: "border-[#c6e0b5] bg-[#e6f2dd] text-[#1f3b1f]"
};

export default function WhatChangedPanel({ comparison, parentLabel }: WhatChangedPanelProps) {
  const [showText, setShowText] = useState(false);

  return (
    <section className="mt-8 rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">What changed</p>
      <p className="mt-2 text-sm text-[#4f4a40]">Compared to {parentLabel}.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#d6d2c6] bg-white/70 p-4 text-sm text-[#4f4a40]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Verdict delta</p>
          <p className="mt-2 text-sm text-[#1f1d18]">
            {comparison.verdict.changed
              ? `${comparison.verdict.from} → ${comparison.verdict.to}`
              : "Verdict unchanged"}
          </p>
        </div>
        <div className="rounded-2xl border border-[#d6d2c6] bg-white/70 p-4 text-sm text-[#4f4a40]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
            Confidence movement
          </p>
          <p className="mt-2 text-sm text-[#1f1d18]">
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
            className={`rounded-2xl border border-[#d6d2c6] bg-white/70 p-4 text-sm text-[#4f4a40] ${
              section.items.length === 0 ? "opacity-70" : ""
            }`}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">{section.label}</p>
            {section.items.length === 0 ? (
              <p className="mt-2 text-xs text-[#6a6459]">No changes.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-[#1f1d18]">
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
          className="rounded-full border border-[#b9b4a6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f4a40]"
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
