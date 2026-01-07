import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Detector",
  description:
    "Check if your writing looks AI-generated. Get confidence scores, signal breakdowns, and actionable tips to reduce false positives.",
  openGraph: {
    title: "AI Detector | Veridict",
    description:
      "Check if your writing looks AI-generated. Get confidence scores and actionable tips."
  }
};

export default function DetectorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
