import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for AI writing detection. Free tier available. Starter at $4/month, Pro at $12/month. Check your essays before submitting.",
  openGraph: {
    title: "Pricing | Veridict",
    description:
      "Simple pricing for AI writing detection. Free tier available. Check your essays before submitting."
  }
};

export default function PricingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
