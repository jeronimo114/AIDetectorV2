export type ToolCategory = "detector" | "humanizer" | "utility" | "generator";

export type ToolConfig = {
  slug: string;
  name: string;
  category: ToolCategory;
  webhookEnvKey: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    h1: string;
    subheading: string;
  };
  ui: {
    badge: string;
    placeholder: string;
    buttonText: string;
    buttonLoadingText: string;
    minChars: number;
    maxChars: number;
  };
  result: {
    type: "detection" | "transformation" | "count" | "generation";
  };
  relatedTools: string[];
};

export type ToolRedirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

export type DetectionResponse = {
  verdict: "Likely AI" | "Unclear" | "Likely Human";
  confidence: number;
  breakdown: string[];
  signals?: string[];
  model?: string;
};

export type TransformationResponse = {
  originalText: string;
  transformedText: string;
  changes?: string[];
};

export type CountResponse = {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
  speakingTime: string;
};

export type GenerationResponse = {
  output: string;
  sections?: string[];
};

export type ToolResponse = DetectionResponse | TransformationResponse | CountResponse | GenerationResponse;
