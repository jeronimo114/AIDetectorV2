import Link from "next/link";
import type { ToolConfig } from "@/lib/tools/types";

interface RelatedToolsProps {
  tools: ToolConfig[];
}

export default function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null;

  return (
    <section className="scroll-fade-up mt-12">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Tools</h2>
      <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-orange-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 group-hover:bg-orange-100 transition-colors">
                {tool.category === "detector" ? (
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                  {tool.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{tool.category}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              {tool.seo.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
