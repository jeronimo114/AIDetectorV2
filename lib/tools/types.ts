export type ToolCategory = "detector" | "humanizer";

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
    type: "detection" | "transformation";
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

export type ToolResponse = DetectionResponse | TransformationResponse;
