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
  { source: "/tools/gpt-detection", destination: "/tools/chatgpt-detector", permanent: true },
  // Essay Outline Generator variants
  { source: "/tools/essay-outline-maker", destination: "/tools/essay-outline-generator", permanent: true },
  { source: "/tools/outline-maker-for-essays", destination: "/tools/essay-outline-generator", permanent: true },
  { source: "/tools/outline-essay-generator", destination: "/tools/essay-outline-generator", permanent: true },
  { source: "/tools/essay-outline-builder", destination: "/tools/essay-outline-generator", permanent: true },
  { source: "/tools/essay-outline", destination: "/tools/essay-outline-generator", permanent: true },
  // AI Thesis Generator variants
  { source: "/tools/thesis-ai", destination: "/tools/ai-thesis-generator", permanent: true },
  { source: "/tools/ai-thesis", destination: "/tools/ai-thesis-generator", permanent: true },
  { source: "/tools/thesis-generator", destination: "/tools/ai-thesis-generator", permanent: true },
  { source: "/tools/thesis-maker", destination: "/tools/ai-thesis-generator", permanent: true },
  // Word Counter variants
  { source: "/tools/word-count", destination: "/tools/word-counter", permanent: true },
  { source: "/tools/word-count-counter", destination: "/tools/word-counter", permanent: true },
  { source: "/tools/count-word-count", destination: "/tools/word-counter", permanent: true },
  { source: "/tools/word-count-checker", destination: "/tools/word-counter", permanent: true },
  { source: "/tools/word-counter-tool", destination: "/tools/word-counter", permanent: true },
  { source: "/tools/count-words-online", destination: "/tools/word-counter", permanent: true },
  { source: "/tools/word-counter-online", destination: "/tools/word-counter", permanent: true },
  { source: "/tools/count-my-words", destination: "/tools/word-counter", permanent: true },
  { source: "/tools/online-word-counter", destination: "/tools/word-counter", permanent: true },
  // Character Counter variants
  { source: "/tools/count-the-letter", destination: "/tools/character-counter", permanent: true },
  { source: "/tools/letter-counter", destination: "/tools/character-counter", permanent: true },
  { source: "/tools/character-count", destination: "/tools/character-counter", permanent: true },
  { source: "/tools/count-characters", destination: "/tools/character-counter", permanent: true },
  // Google Docs Word Counter variants
  { source: "/tools/google-doc-word-counter", destination: "/tools/google-docs-word-counter", permanent: true },
  { source: "/tools/word-count-google-docs", destination: "/tools/google-docs-word-counter", permanent: true },
  { source: "/tools/count-words-google-docs", destination: "/tools/google-docs-word-counter", permanent: true },
  { source: "/tools/word-counter-google-docs", destination: "/tools/google-docs-word-counter", permanent: true }
];

export function getNextRedirects() {
  return toolRedirects.map(({ source, destination, permanent }) => ({
    source,
    destination,
    permanent
  }));
}
