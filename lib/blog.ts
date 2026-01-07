import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/posts");

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  slug: string;
  image?: string;
  tags?: string[];
};

export type Post = {
  frontmatter: PostFrontmatter;
  content: string;
  readingTime: string;
};

export type PostMeta = {
  frontmatter: PostFrontmatter;
  readingTime: string;
};

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => name.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    frontmatter: {
      title: data.title || "",
      description: data.description || "",
      date: data.date || "",
      slug: slug,
      image: data.image,
      tags: data.tags
    },
    content,
    readingTime: readingTime(content).text
  };
}

export function getAllPosts(): PostMeta[] {
  const slugs = getAllPostSlugs();

  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post) return null;

      return {
        frontmatter: post.frontmatter,
        readingTime: post.readingTime
      };
    })
    .filter((post): post is PostMeta => post !== null);

  return posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date);
    const dateB = new Date(b.frontmatter.date);
    return dateB.getTime() - dateA.getTime();
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
