"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "Vary sentence length.",
  "Add a concrete detail that is specific to you.",
  "Reduce repeated sentence openings.",
  "Use natural transitions between ideas.",
  "Mix short and long sentences.",
  "Read it aloud and adjust rigid phrasing.",
  "Use precise verbs instead of repeated \"is/are\" forms.",
  "Add a brief line of personal context.",
  "Avoid identical sentence structures.",
  "Keep punctuation natural."
];

type TipRotatorProps = {
  isActive: boolean;
};

export default function TipRotator({ isActive }: TipRotatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % TIPS.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-[#d8d6cf] bg-[#f3f3ef] px-4 py-3 text-sm text-[#4c4b45]">
      <span className="text-xs uppercase tracking-[0.25em] text-[#7a7670]">
        Guidance:
      </span>
      <span className="ml-2">{TIPS[index]}</span>
    </div>
  );
}
