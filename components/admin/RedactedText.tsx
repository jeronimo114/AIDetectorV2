"use client";

import { useState } from "react";

type RedactedTextProps = {
  text: string;
  previewLength?: number;
};

export default function RedactedText({ text, previewLength = 140 }: RedactedTextProps) {
  const [revealed, setRevealed] = useState(false);
  const preview = text.slice(0, previewLength);

  return (
    <div className="space-y-2">
      <p className="text-sm text-[#1f1d18]">
        {revealed ? text : `${preview}${text.length > previewLength ? "..." : ""}`}
      </p>
      <button
        type="button"
        onClick={() => setRevealed((prev) => !prev)}
        className="text-xs uppercase tracking-[0.2em] text-[#6a6459]"
      >
        {revealed ? "Hide" : "Reveal"}
      </button>
    </div>
  );
}
