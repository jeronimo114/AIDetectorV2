"use client";

import Link from "next/link";

import { tools } from "@/lib/tools/config";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function ToolsIndexContent() {
  useScrollAnimation();

  const detectorTools = tools.filter((t) => t.category === "detector");
  const humanizerTools = tools.filter((t) => t.category === "humanizer");
  const generatorTools = tools.filter((t) => t.category === "generator");
  const utilityTools = tools.filter((t) => t.category === "utility");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="text-center opacity-0 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-medium text-orange-700">Free Tools</span>
          </div>
          <h1 className="mt-5 text-4xl font-bold text-gray-900 sm:text-5xl">
            AI Writing Tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Check your content for AI patterns, humanize your writing, and submit with confidence. All tools are free to use.
          </p>
        </div>

        {/* Detection Tools */}
        <section className="scroll-fade-up mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-orange-500">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">AI Detectors</h2>
          </div>
          <p className="text-gray-600 mb-8">
            Analyze your text for patterns commonly associated with AI-generated content.
          </p>
          <div className="stagger-children grid gap-4 sm:grid-cols-2">
            {detectorTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-md hover-lift"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {tool.seo.description}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-500 group-hover:bg-orange-100 transition-colors">
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                      <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tool.seo.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Humanizer Tools */}
        <section className="scroll-fade-up mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-emerald-500">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">AI Humanizers</h2>
          </div>
          <p className="text-gray-600 mb-8">
            Transform AI-generated text to sound more natural and human-written.
          </p>
          <div className="stagger-children grid gap-4 sm:grid-cols-2">
            {humanizerTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md hover-lift"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {tool.seo.description}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100 transition-colors">
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                      <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tool.seo.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Generator Tools */}
        {generatorTools.length > 0 && (
          <section className="scroll-fade-up mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-violet-500">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Content Generators</h2>
            </div>
            <p className="text-gray-600 mb-8">
              Generate essay outlines, thesis statements, and other academic content.
            </p>
            <div className="stagger-children grid gap-4 sm:grid-cols-2">
              {generatorTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-violet-200 hover:shadow-md hover-lift"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {tool.seo.description}
                      </p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-500 group-hover:bg-violet-100 transition-colors">
                      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                        <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tool.seo.keywords.slice(0, 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Utility Tools */}
        {utilityTools.length > 0 && (
          <section className="scroll-fade-up mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-blue-500">
                  <path d="M9 7h6M9 12h6M9 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Writing Utilities</h2>
            </div>
            <p className="text-gray-600 mb-8">
              Free tools to count words, characters, and analyze your text. No signup required.
            </p>
            <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {utilityTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md hover-lift"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {tool.seo.description}
                      </p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors">
                      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                        <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Free · No signup
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="scroll-fade-up mt-16 rounded-2xl border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Ready to check your writing?
              </h2>
              <p className="mt-2 text-gray-600 max-w-lg">
                Create a free account to save your history, track revisions, and access detailed analysis reports.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started Free
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/detector"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                Try Main Detector
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="scroll-fade-up mt-16 text-center text-sm text-gray-500">
          <p className="font-medium">Signals over accusations · Probability over certainty</p>
        </footer>
      </div>
    </main>
  );
}
