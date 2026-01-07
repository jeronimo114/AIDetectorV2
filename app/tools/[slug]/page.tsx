import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ToolPage from "@/components/tools/ToolPage";
import { getToolBySlug, getAllToolSlugs } from "@/lib/tools/config";
import { toolPageSchema, toolBreadcrumbSchema } from "@/lib/tools/schemas";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found | Veridict",
      description: "The requested tool could not be found."
    };
  }

  return {
    title: tool.seo.title,
    description: tool.seo.description,
    keywords: tool.seo.keywords,
    openGraph: {
      title: tool.seo.title,
      description: tool.seo.description,
      url: `https://veridict.com/tools/${tool.slug}`,
      siteName: "Veridict",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: tool.seo.title,
      description: tool.seo.description
    },
    alternates: {
      canonical: `https://veridict.com/tools/${tool.slug}`
    }
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolPageSchema(tool))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolBreadcrumbSchema(tool))
        }}
      />
      <ToolPage config={tool} />
    </>
  );
}
