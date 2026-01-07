import type { Metadata } from "next";

import ToolsIndexContent from "@/components/tools/ToolsIndexContent";

export const metadata: Metadata = {
  title: "Free AI Writing Tools | Veridict",
  description: "Free AI writing tools including AI detectors, essay checkers, and humanizers. Check your content for AI patterns and improve your writing.",
  keywords: ["ai tools", "ai detector", "ai humanizer", "essay checker", "chatgpt detector"],
  openGraph: {
    title: "Free AI Writing Tools | Veridict",
    description: "Free AI writing tools including AI detectors, essay checkers, and humanizers.",
    url: "https://veridict.com/tools",
    siteName: "Veridict",
    type: "website"
  },
  alternates: {
    canonical: "https://veridict.com/tools"
  }
};

export default function ToolsPage() {
  return <ToolsIndexContent />;
}
