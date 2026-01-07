import type { ToolConfig } from "./types";

export function toolPageSchema(tool: ToolConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.seo.description,
    url: `https://veridict.com/tools/${tool.slug}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    provider: {
      "@type": "Organization",
      name: "Veridict",
      url: "https://veridict.com"
    }
  };
}

export function toolBreadcrumbSchema(tool: ToolConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://veridict.com"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://veridict.com/tools"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `https://veridict.com/tools/${tool.slug}`
      }
    ]
  };
}
