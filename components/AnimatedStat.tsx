"use client";

import AnimatedCounter from "@/components/AnimatedCounter";

interface AnimatedStatProps {
  value: string;
  duration?: number;
  className?: string;
}

// Parse stat strings like "50K+", "98%", "$16M+", "24/7", "<2s", "1.2s"
function parseStatValue(value: string): {
  numericValue: number;
  prefix: string;
  suffix: string;
  isAnimatable: boolean;
  decimals: number;
} {
  const trimmed = value.trim();

  // Special cases that shouldn't animate
  if (trimmed === "24/7" || trimmed === "A+" || trimmed === "Pro") {
    return { numericValue: 0, prefix: "", suffix: trimmed, isAnimatable: false, decimals: 0 };
  }

  let prefix = "";
  let suffix = "";
  let numericPart = trimmed;
  let decimals = 0;

  // Extract leading characters (like $ or <)
  const leadingMatch = numericPart.match(/^([<>$]+)/);
  if (leadingMatch) {
    prefix = leadingMatch[1];
    numericPart = numericPart.slice(prefix.length);
  }

  // Extract trailing characters (like +, %, K, M, s, etc.)
  const trailingMatch = numericPart.match(/([KMBkm%+s]+)$/i);
  if (trailingMatch) {
    suffix = trailingMatch[1];
    numericPart = numericPart.slice(0, -suffix.length);
  }

  // Parse the numeric value
  const numericValue = parseFloat(numericPart);

  if (isNaN(numericValue)) {
    return { numericValue: 0, prefix: "", suffix: trimmed, isAnimatable: false, decimals: 0 };
  }

  // Check for decimals
  if (numericPart.includes(".")) {
    const decimalPart = numericPart.split(".")[1];
    decimals = decimalPart ? decimalPart.length : 0;
  }

  return { numericValue, prefix, suffix, isAnimatable: true, decimals };
}

export default function AnimatedStat({
  value,
  duration = 2000,
  className = ""
}: AnimatedStatProps) {
  const parsed = parseStatValue(value);

  if (!parsed.isAnimatable) {
    return <span className={className}>{value}</span>;
  }

  return (
    <AnimatedCounter
      value={parsed.numericValue}
      prefix={parsed.prefix}
      suffix={parsed.suffix}
      duration={duration}
      decimals={parsed.decimals}
      className={className}
    />
  );
}
