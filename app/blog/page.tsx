import type { Metadata } from "next";
import Link from "next/link";

import { getAllPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, guides, and insights on AI detection, academic writing, and how to improve your essays. Learn how AI detectors work and how to write authentically."
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-[#e6ecf1] opacity-70 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#edf2f5] opacity-70 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[900px] px-6 pb-24 pt-16">
        <header className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-[#7a7670]">
            Blog
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-[#1f1f1c]">
            Guides & Insights
          </h1>
          <p className="mt-4 text-base text-[#4c4b45]">
            Learn how AI detection works, improve your writing, and understand
            the signals that matter.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-[#d8d6cf] bg-white/85 p-8 text-center shadow-[0_18px_60px_rgba(27,24,19,0.08)]">
            <p className="text-sm text-[#7a7670]">
              No posts yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="mt-12 space-y-6">
            {posts.map((post) => (
              <article key={post.frontmatter.slug}>
                <Link
                  href={`/blog/${post.frontmatter.slug}`}
                  className="group block rounded-3xl border border-[#d8d6cf] bg-white/85 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] transition hover:border-[#c4c1b8] hover:shadow-[0_22px_70px_rgba(27,24,19,0.12)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-[#7a7670]">
                        {formatDate(post.frontmatter.date)} · {post.readingTime}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-[#1f1f1c] transition group-hover:text-[#2f3e4e]">
                        {post.frontmatter.title}
                      </h2>
                      <p className="mt-2 text-sm text-[#4c4b45] line-clamp-2">
                        {post.frontmatter.description}
                      </p>
                      {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {post.frontmatter.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#eef1f3] px-3 py-1 text-xs text-[#4a5560]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="mt-1 text-[#7a7670] transition group-hover:translate-x-1 group-hover:text-[#2f3e4e]">
                      →
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
