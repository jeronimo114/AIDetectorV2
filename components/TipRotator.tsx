"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "If you want it to read more human, vary sentence length.",
  "Avoid repeating the same transition words each paragraph.",
  "Add one concrete detail that only you would know.",
  "Keep punctuation natural, not perfectly uniform.",
  "Use mild imperfections: a parenthetical aside, a short fragment.",
  "Balance concise lines with one longer, reflective sentence.",
  "Mix specific examples with general statements.",
  "Read it out loud and tweak any robotic phrasing.",
  "Swap a synonym or two to prevent patterned wording.",
  "Let your voice show with subtle opinions or preferences.",
  "Break up long paragraphs for easier scanning.",
  "Vary the opening words of successive sentences.",
  "Use purposeful verbs instead of repeated \"is/are\" structures.",
  "Consider adding a small sensory detail or observation."
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
    <div className="mt-4 rounded-2xl border border-[#ded8ca] bg-[#f6f3ea] px-4 py-3 text-sm text-[#4f4a40]">
      <span className="text-xs uppercase tracking-[0.25em] text-[#7b756a]">
        Tip:
      </span>
      <span className="ml-2">{TIPS[index]}</span>
    </div>
  );
}
