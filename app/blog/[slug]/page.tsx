import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import LoadingLink from "@/components/LoadingLink";
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
    <h1 className="mt-8 text-3xl font-bold text-gray-900" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-8 text-2xl font-bold text-gray-900" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-6 text-xl font-semibold text-gray-900" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-4 text-base leading-relaxed text-gray-600" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-600" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-gray-600" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-base leading-relaxed" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="font-medium text-orange-600 underline hover:text-orange-500" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-4 border-l-4 border-orange-200 pl-4 italic text-gray-500"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-700" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="mt-4 overflow-x-auto rounded-xl bg-gray-900 p-4 font-mono text-sm text-gray-100"
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-gray-900" {...props} />
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="mt-6 overflow-x-auto">
      <table
        className="w-full border-collapse text-left text-sm text-gray-600"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-gray-50 text-gray-700" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border border-gray-200 px-3 py-2 font-semibold" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-gray-200 px-3 py-2 align-top" {...props} />
  ),
  hr: () => <hr className="my-8 border-t border-gray-200" />
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
      url: "https://veridict.xyz"
    }
  };

  return (
    <main className="relative min-h-screen bg-white">
      <JsonLd data={articleSchema} />

      <article className="mx-auto w-full max-w-[720px] px-6 pb-20 pt-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to blog
        </Link>

        <header className="mt-8">
          <p className="text-sm text-gray-500">
            {formatDate(post.frontmatter.date)} · {post.readingTime}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            {post.frontmatter.title}
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            {post.frontmatter.description}
          </p>
          {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <hr className="my-8 border-t border-gray-200" />

        <div className="prose-veridict">
          <MDXRemote source={post.content} components={components} />
        </div>

        <hr className="my-8 border-t border-gray-200" />

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900">Ready to check your writing?</h3>
          <p className="mt-2 text-gray-600">
            See what AI detectors see before you submit.
          </p>
          <LoadingLink
            href="/signup?redirectedFrom=/detector"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
          >
            Try Veridict Free
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LoadingLink>
        </div>
      </article>
    </main>
  );
}
