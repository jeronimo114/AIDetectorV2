import type { Metadata } from "next";
import Link from "next/link";

import LoadingLink from "@/components/LoadingLink";
import { getAllPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, guides, and insights on AI detection, academic writing, and how to improve your essays. Learn how AI detectors work and how to write authentically."
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="relative min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="mx-auto max-w-[900px] px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-sm font-medium text-orange-700">Blog</span>
          </div>
          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Guides & Insights
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Learn how AI detection works, improve your writing, and understand
            the signals that matter.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="pb-20">
        <div className="mx-auto max-w-[900px] px-6">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">
                No posts yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article key={post.frontmatter.slug}>
                  <Link
                    href={`/blog/${post.frontmatter.slug}`}
                    className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">
                          {formatDate(post.frontmatter.date)} · {post.readingTime}
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-gray-900 transition group-hover:text-orange-600">
                          {post.frontmatter.title}
                        </h2>
                        <p className="mt-2 text-gray-600 line-clamp-2">
                          {post.frontmatter.description}
                        </p>
                        {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {post.frontmatter.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="mt-1 text-gray-400 transition group-hover:translate-x-1 group-hover:text-orange-500">
                        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                          <path d="M7 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-[600px] px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Ready to check your writing?
          </h2>
          <p className="mt-3 text-gray-600">
            See what AI detectors see before you submit.
          </p>
          <LoadingLink
            href="/signup?redirectedFrom=/detector"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg"
          >
            Try Veridict Free
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LoadingLink>
        </div>
      </section>
    </main>
  );
}
