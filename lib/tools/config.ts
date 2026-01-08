import type { ToolConfig } from "./types";

export const tools: ToolConfig[] = [
  // Detection Tools
  {
    slug: "ai-writing-detector",
    name: "AI Writing Detector",
    category: "detector",
    webhookEnvKey: "NEXT_PUBLIC_N8N_WEBHOOK_URL",
    seo: {
      title: "Free AI Writing Detector - Check Your Text Instantly",
      description: "Free AI writing detector to check if your essay or content looks AI-generated. Get instant results with confidence scores and actionable signals.",
      keywords: ["ai writing detector", "ai detector", "check ai writing", "ai content detector"],
      h1: "AI Writing Detector",
      subheading: "Check if your text looks AI-generated before you submit. Get instant signals and confidence scores for free."
    },
    ui: {
      badge: "AI Writing Detector",
      placeholder: "Paste your text here to check for AI patterns...",
      buttonText: "Check Text",
      buttonLoadingText: "Analyzing...",
      minChars: 80,
      maxChars: 1500
    },
    result: { type: "detection" },
    relatedTools: ["essay-ai-detector", "chatgpt-detector", "artificial-intelligence-detector"]
  },
  {
    slug: "essay-ai-detector",
    name: "Essay AI Detector",
    category: "detector",
    webhookEnvKey: "NEXT_PUBLIC_N8N_WEBHOOK_URL",
    seo: {
      title: "Free Essay AI Detector - Check Your Essay Before Submitting",
      description: "Free essay AI detector specifically designed for academic writing. Check your essay for AI patterns before submission and avoid detection issues.",
      keywords: ["ai detector essay", "essay ai detector", "check essay for ai", "academic ai detector"],
      h1: "Essay AI Detector",
      subheading: "Check your academic essay for AI patterns before submission. Built specifically for students who want to submit with confidence."
    },
    ui: {
      badge: "Essay AI Detector",
      placeholder: "Paste your essay here to check for AI patterns...",
      buttonText: "Check Essay",
      buttonLoadingText: "Analyzing essay...",
      minChars: 80,
      maxChars: 1500
    },
    result: { type: "detection" },
    relatedTools: ["ai-writing-detector", "chatgpt-detector"]
  },
  {
    slug: "artificial-intelligence-detector",
    name: "Artificial Intelligence Detector",
    category: "detector",
    webhookEnvKey: "NEXT_PUBLIC_N8N_WEBHOOK_URL",
    seo: {
      title: "Free Artificial Intelligence Detector - AI Content Check",
      description: "Detect artificial intelligence generated content in your writing. Free tool with instant results, confidence scores, and detailed signal analysis.",
      keywords: ["artificial intelligence detector", "ai content detector", "detect ai text"],
      h1: "Artificial Intelligence Detector",
      subheading: "Detect AI-generated patterns in any text. Get instant feedback with confidence scores and actionable signals."
    },
    ui: {
      badge: "AI Detector",
      placeholder: "Enter your text to analyze for AI patterns...",
      buttonText: "Detect AI",
      buttonLoadingText: "Detecting...",
      minChars: 80,
      maxChars: 1500
    },
    result: { type: "detection" },
    relatedTools: ["ai-writing-detector", "essay-ai-detector", "chatgpt-detector"]
  },
  {
    slug: "chatgpt-detector",
    name: "ChatGPT Detector",
    category: "detector",
    webhookEnvKey: "NEXT_PUBLIC_N8N_WEBHOOK_URL",
    seo: {
      title: "Free ChatGPT Detector - Check for ChatGPT Content",
      description: "Free ChatGPT detector to identify content written by ChatGPT and other GPT models. Instant analysis with confidence scores and signals.",
      keywords: ["chatgpt detector", "detect chatgpt", "gpt detector", "gpt detection", "chat gpt detector"],
      h1: "ChatGPT Detector",
      subheading: "Detect content written by ChatGPT and other GPT models. Get instant results with detailed signal breakdown."
    },
    ui: {
      badge: "ChatGPT Detector",
      placeholder: "Paste content to check for ChatGPT patterns...",
      buttonText: "Check for ChatGPT",
      buttonLoadingText: "Checking...",
      minChars: 80,
      maxChars: 1500
    },
    result: { type: "detection" },
    relatedTools: ["ai-writing-detector", "essay-ai-detector"]
  },
  // Humanizer Tools
  {
    slug: "ai-humanizer",
    name: "AI Humanizer",
    category: "humanizer",
    webhookEnvKey: "NEXT_PUBLIC_N8N_HUMANIZER_WEBHOOK_URL",
    seo: {
      title: "Free AI Humanizer - Make AI Text Sound Human",
      description: "Free AI humanizer tool to make AI-generated text sound more natural and human-written. Reduce AI detection signals effectively.",
      keywords: ["ai humanizer", "humanize ai text", "make ai text human", "ai to human text"],
      h1: "AI Humanizer",
      subheading: "Transform AI-generated text to sound more natural and human-written. Reduce detection signals instantly."
    },
    ui: {
      badge: "AI Humanizer",
      placeholder: "Paste AI-generated text to humanize...",
      buttonText: "Humanize Text",
      buttonLoadingText: "Humanizing...",
      minChars: 80,
      maxChars: 1500
    },
    result: { type: "transformation" },
    relatedTools: ["essay-humanizer", "ai-text-remover"]
  },
  {
    slug: "essay-humanizer",
    name: "Essay Humanizer",
    category: "humanizer",
    webhookEnvKey: "NEXT_PUBLIC_N8N_HUMANIZER_WEBHOOK_URL",
    seo: {
      title: "Free Essay Humanizer - Make Essays Sound Natural",
      description: "Free essay humanizer to make your academic writing sound more natural. Perfect for students who want authentic-sounding essays.",
      keywords: ["essay humanizer", "humanize essay", "natural essay writing", "essay rewriter"],
      h1: "Essay Humanizer",
      subheading: "Make your essay sound more natural and authentic. Perfect for academic writing that needs a human touch."
    },
    ui: {
      badge: "Essay Humanizer",
      placeholder: "Paste your essay to humanize...",
      buttonText: "Humanize Essay",
      buttonLoadingText: "Humanizing...",
      minChars: 80,
      maxChars: 1500
    },
    result: { type: "transformation" },
    relatedTools: ["ai-humanizer", "ai-text-remover"]
  },
  {
    slug: "ai-text-remover",
    name: "AI Text Remover",
    category: "humanizer",
    webhookEnvKey: "NEXT_PUBLIC_N8N_HUMANIZER_WEBHOOK_URL",
    seo: {
      title: "Free AI Text Remover - Remove AI Patterns from Text",
      description: "Free AI text remover to eliminate AI detection patterns from your writing. Make your content sound more human and natural.",
      keywords: ["ai text remover", "remove ai patterns", "undetectable ai text", "remove ai detection"],
      h1: "AI Text Remover",
      subheading: "Remove AI patterns from your text. Reduce detection signals and make your writing sound more natural."
    },
    ui: {
      badge: "AI Remover",
      placeholder: "Paste text to remove AI patterns...",
      buttonText: "Remove AI Patterns",
      buttonLoadingText: "Processing...",
      minChars: 80,
      maxChars: 1500
    },
    result: { type: "transformation" },
    relatedTools: ["ai-humanizer", "essay-humanizer"]
  },
  // Generator Tools
  {
    slug: "essay-outline-generator",
    name: "Essay Outline Generator",
    category: "generator",
    webhookEnvKey: "NEXT_PUBLIC_N8N_OUTLINE_WEBHOOK_URL",
    seo: {
      title: "Free Essay Outline Generator - Create Essay Outlines Instantly",
      description: "Free essay outline generator to create structured outlines for your essays. Generate professional essay outlines with thesis, body paragraphs, and conclusions.",
      keywords: ["essay outline generator", "essay outline maker", "outline maker for essays", "outline essay generator", "essay outline builder"],
      h1: "Essay Outline Generator",
      subheading: "Create professional essay outlines instantly. Enter your topic and get a structured outline with thesis, arguments, and conclusions."
    },
    ui: {
      badge: "Essay Outline",
      placeholder: "Enter your essay topic or thesis statement...",
      buttonText: "Generate Outline",
      buttonLoadingText: "Generating...",
      minChars: 10,
      maxChars: 500
    },
    result: { type: "generation" },
    relatedTools: ["ai-thesis-generator", "essay-ai-detector"]
  },
  {
    slug: "ai-thesis-generator",
    name: "AI Thesis Generator",
    category: "generator",
    webhookEnvKey: "NEXT_PUBLIC_N8N_THESIS_WEBHOOK_URL",
    seo: {
      title: "Free AI Thesis Generator - Create Strong Thesis Statements",
      description: "Free AI thesis generator to create compelling thesis statements for your essays. Generate clear, arguable thesis statements instantly.",
      keywords: ["ai thesis", "thesis ai", "ai thesis generator", "thesis statement generator", "thesis maker"],
      h1: "AI Thesis Generator",
      subheading: "Generate strong, arguable thesis statements for your essays. Enter your topic and get a professional thesis instantly."
    },
    ui: {
      badge: "Thesis Generator",
      placeholder: "Enter your essay topic or main argument...",
      buttonText: "Generate Thesis",
      buttonLoadingText: "Generating...",
      minChars: 10,
      maxChars: 300
    },
    result: { type: "generation" },
    relatedTools: ["essay-outline-generator", "essay-ai-detector"]
  },
  // Utility Tools
  {
    slug: "word-counter",
    name: "Word Counter",
    category: "utility",
    webhookEnvKey: "",
    seo: {
      title: "Free Word Counter - Count Words, Characters & Sentences Online",
      description: "Free online word counter tool. Count words, characters, sentences, and paragraphs instantly. Check reading time and get detailed text statistics.",
      keywords: ["word count", "word counter", "word count counter", "count words online", "word counter online", "word counter tool", "word count checker", "check number of words", "count my words online", "count number of words online"],
      h1: "Word Counter",
      subheading: "Count words, characters, sentences, and paragraphs instantly. Free online tool with reading time estimates."
    },
    ui: {
      badge: "Word Counter",
      placeholder: "Paste or type your text here to count words, characters, and more...",
      buttonText: "Count Words",
      buttonLoadingText: "Counting...",
      minChars: 1,
      maxChars: 100000
    },
    result: { type: "count" },
    relatedTools: ["character-counter", "google-docs-word-counter"]
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    category: "utility",
    webhookEnvKey: "",
    seo: {
      title: "Free Character Counter - Count Characters & Letters Online",
      description: "Free online character counter tool. Count characters, letters, spaces, and words instantly. Perfect for social media posts and text limits.",
      keywords: ["character counter", "count the letter", "letter counter", "character count", "count characters online"],
      h1: "Character Counter",
      subheading: "Count characters, letters, and spaces instantly. Perfect for Twitter, Instagram, and text with character limits."
    },
    ui: {
      badge: "Character Counter",
      placeholder: "Type or paste your text here to count characters...",
      buttonText: "Count Characters",
      buttonLoadingText: "Counting...",
      minChars: 1,
      maxChars: 100000
    },
    result: { type: "count" },
    relatedTools: ["word-counter", "google-docs-word-counter"]
  },
  {
    slug: "google-docs-word-counter",
    name: "Google Docs Word Counter",
    category: "utility",
    webhookEnvKey: "",
    seo: {
      title: "Free Word Counter for Google Docs - Count Words Online",
      description: "Free word counter for Google Docs content. Copy your text from Google Docs and count words, characters, and sentences instantly online.",
      keywords: ["word count on google docs", "google docs word counter", "word counter for google docs", "google doc count words", "count words google docs", "google docs count words", "counting words in google docs", "word count for google docs", "google docs number of words"],
      h1: "Google Docs Word Counter",
      subheading: "Copy your Google Docs text and count words instantly. Get accurate word counts, character counts, and reading time estimates."
    },
    ui: {
      badge: "Google Docs",
      placeholder: "Paste your Google Docs text here to count words...",
      buttonText: "Count Words",
      buttonLoadingText: "Counting...",
      minChars: 1,
      maxChars: 100000
    },
    result: { type: "count" },
    relatedTools: ["word-counter", "character-counter"]
  }
];

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getAllToolSlugs(): string[] {
  return tools.map((tool) => tool.slug);
}

export function getRelatedTools(slug: string): ToolConfig[] {
  const tool = getToolBySlug(slug);
  if (!tool) return [];
  return tool.relatedTools
    .map((s) => getToolBySlug(s))
    .filter((t): t is ToolConfig => t !== undefined);
}
