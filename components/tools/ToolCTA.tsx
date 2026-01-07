import LoadingLink from "@/components/LoadingLink";

interface ToolCTAProps {
  toolSlug: string;
  showMainDetectorLink?: boolean;
}

export default function ToolCTA({ toolSlug, showMainDetectorLink = true }: ToolCTAProps) {
  return (
    <section className="mt-12 rounded-2xl border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-8 shadow-sm opacity-0 animate-fade-up" style={{ animationDelay: "280ms" }}>
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
          <LoadingLink
            href={`/signup?redirectedFrom=/tools/${toolSlug}`}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5"
          >
            Get Started Free
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LoadingLink>
          {showMainDetectorLink && (
            <LoadingLink
              href="/detector"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              Try Main Detector
            </LoadingLink>
          )}
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-emerald-500">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Free to start
          </div>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-emerald-500">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            No credit card required
          </div>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-emerald-500">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Instant results
          </div>
        </div>
      </div>
    </section>
  );
}
