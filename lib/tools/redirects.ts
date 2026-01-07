import type { ToolRedirect } from "./types";

export const toolRedirects: ToolRedirect[] = [
  // AI Writing Detector variants
  { source: "/tools/ai-written-detector", destination: "/tools/ai-writing-detector", permanent: true },
  { source: "/tools/ai-write-detector", destination: "/tools/ai-writing-detector", permanent: true },
  { source: "/tools/writer-ai-detector", destination: "/tools/ai-writing-detector", permanent: true },
  { source: "/tools/writing-ai-detector", destination: "/tools/ai-writing-detector", permanent: true },
  { source: "/tools/ai-detector-writer", destination: "/tools/ai-writing-detector", permanent: true },
  { source: "/tools/ai-writer-detector", destination: "/tools/ai-writing-detector", permanent: true },
  // ChatGPT Detector variants
  { source: "/tools/chat-gpt-detector", destination: "/tools/chatgpt-detector", permanent: true },
  { source: "/tools/chatgpt-detectors", destination: "/tools/chatgpt-detector", permanent: true },
  { source: "/tools/gpt-detectors", destination: "/tools/chatgpt-detector", permanent: true },
  { source: "/tools/gpt-detection", destination: "/tools/chatgpt-detector", permanent: true }
];

export function getNextRedirects() {
  return toolRedirects.map(({ source, destination, permanent }) => ({
    source,
    destination,
    permanent
  }));
}
