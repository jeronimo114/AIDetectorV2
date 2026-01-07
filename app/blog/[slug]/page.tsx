import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { getAllPostSlugs, getPostBySlug, formatDate } from "@/lib/blog";
import JsonLd from "@/components/JsonLd";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found"
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: "article",
      publishedTime: post.frontmatter.date,
      authors: ["Veridict"]
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description
    }
  };
}

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mt-8 text-3xl font-semibold text-[#1f1f1c]" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-8 text-2xl font-semibold text-[#1f1f1c]" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-6 text-xl font-semibold text-[#1f1f1c]" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-4 text-base leading-relaxed text-[#4c4b45]" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-[#4c4b45]" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-[#4c4b45]" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-base leading-relaxed" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="font-medium text-[#2f3e4e] underline hover:text-[#1f1f1c]" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-4 border-l-4 border-[#d8d6cf] pl-4 italic text-[#7a7670]"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-[#eef1f3] px-1.5 py-0.5 font-mono text-sm text-[#4c4b45]" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="mt-4 overflow-x-auto rounded-2xl bg-[#2f3e4e] p-4 font-mono text-sm text-[#f7f7f4]"
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-[#1f1f1c]" {...props} />
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="mt-6 overflow-x-auto">
      <table
        className="w-full border-collapse text-left text-sm text-[#4c4b45]"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-[#eef1f3] text-[#4a5560]" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border border-[#d8d6cf] px-3 py-2 font-semibold" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-[#d8d6cf] px-3 py-2 align-top" {...props} />
  ),
  hr: () => <hr className="my-8 border-t border-[#d8d6cf]" />
};

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.date,
    author: {
      "@type": "Organization",
      name: "Veridict"
    },
    publisher: {
      "@type": "Organization",
      name: "Veridict",
      url: "https://veridict.com"
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4]">
      <JsonLd data={articleSchema} />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-[#e6ecf1] opacity-70 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#edf2f5] opacity-70 blur-3xl" />
      </div>

      <article className="relative mx-auto w-full max-w-[720px] px-6 pb-24 pt-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#7a7670] transition hover:text-[#4c4b45]"
        >
          ← Back to blog
        </Link>

        <header className="mt-8">
          <p className="text-xs text-[#7a7670]">
            {formatDate(post.frontmatter.date)} · {post.readingTime}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-[#1f1f1c]">
            {post.frontmatter.title}
          </h1>
          <p className="mt-4 text-lg text-[#4c4b45]">
            {post.frontmatter.description}
          </p>
          {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
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
        </header>

        <hr className="my-8 border-t border-[#d8d6cf]" />

        <div className="prose-veridict">
          <MDXRemote source={post.content} components={components} />
        </div>

        <hr className="my-8 border-t border-[#d8d6cf]" />

        <div className="rounded-3xl border border-[#d8d6cf] bg-[#f3f3ef] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            Ready to check your writing?
          </p>
          <p className="mt-2 text-sm text-[#4c4b45]">
            See what AI detectors see before you submit.
          </p>
          <Link
            href="/signup?redirectedFrom=/detector"
            className="mt-4 inline-block rounded-full bg-[#2f3e4e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7f7f4] transition hover:bg-[#3b4d60]"
          >
            Try Veridict Free
          </Link>
        </div>
      </article>
    </main>
  );
}
