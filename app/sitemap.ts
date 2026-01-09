import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";

import { getAllPosts } from "@/lib/blog";
import { getAllToolSlugs } from "@/lib/tools/config";

type StaticRouteMeta = Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority">;

const baseUrl = "https://veridict.xyz";
const appDir = path.join(process.cwd(), "app");
const postsDir = path.join(process.cwd(), "content/posts");
const toolsConfigPath = path.join(process.cwd(), "lib/tools/config.ts");

const EXCLUDED_ROUTE_PREFIXES = [
  "/admin",
  "/dashboard",
  "/maintenance",
  "/suspended",
  "/checkout",
  "/api"
];

const STATIC_ROUTE_OVERRIDES: Record<string, StaticRouteMeta> = {
  "/": { changeFrequency: "weekly", priority: 1 },
  "/detector": { changeFrequency: "weekly", priority: 0.9 },
  "/pricing": { changeFrequency: "monthly", priority: 0.8 },
  "/blog": { changeFrequency: "weekly", priority: 0.8 },
  "/privacy-policy": { changeFrequency: "yearly", priority: 0.4 },
  "/terms-of-service": { changeFrequency: "yearly", priority: 0.4 },
  "/cookie-policy": { changeFrequency: "yearly", priority: 0.3 },
  "/disclaimer": { changeFrequency: "yearly", priority: 0.3 },
  "/tools": { changeFrequency: "weekly", priority: 0.8 },
  "/login": { changeFrequency: "monthly", priority: 0.3 },
  "/signup": { changeFrequency: "monthly", priority: 0.5 }
};

const DEFAULT_STATIC_META: StaticRouteMeta = {
  changeFrequency: "monthly",
  priority: 0.6
};

type StaticRoute = { route: string; lastModified: Date };

const isRouteGroup = (segment: string): boolean =>
  segment.startsWith("(") && segment.endsWith(")");
const isParallelRoute = (segment: string): boolean => segment.startsWith("@");
const isDynamicSegment = (segment: string): boolean =>
  segment.startsWith("[") && segment.endsWith("]");

const shouldExcludeRoute = (route: string): boolean =>
  EXCLUDED_ROUTE_PREFIXES.some((prefix) => route === prefix || route.startsWith(`${prefix}/`));

const buildRoute = (baseRoute: string, segment: string): string =>
  baseRoute ? `${baseRoute}/${segment}` : `/${segment}`;

const getValidDate = (value: string, fallback: Date): Date => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const collectStaticRoutes = (dir: string, baseRoute: string): StaticRoute[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const routes: StaticRoute[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (isDynamicSegment(entry.name)) {
        continue;
      }

      const nextRoute =
        isRouteGroup(entry.name) || isParallelRoute(entry.name)
          ? baseRoute
          : buildRoute(baseRoute, entry.name);
      routes.push(...collectStaticRoutes(entryPath, nextRoute));
      continue;
    }

    if (entry.isFile() && entry.name.startsWith("page.")) {
      const route = baseRoute || "/";
      routes.push({ route, lastModified: fs.statSync(entryPath).mtime });
    }
  }

  return routes;
};

const getStaticRoutes = (): StaticRoute[] => {
  const collected = collectStaticRoutes(appDir, "");
  const deduped = new Map<string, Date>();

  for (const route of collected) {
    if (shouldExcludeRoute(route.route)) {
      continue;
    }
    const current = deduped.get(route.route);
    if (!current || route.lastModified > current) {
      deduped.set(route.route, route.lastModified);
    }
  }

  return Array.from(deduped, ([route, lastModified]) => ({ route, lastModified }));
};

const getPostLastModified = (slug: string, fallbackDate: string): Date => {
  const postPath = path.join(postsDir, `${slug}.mdx`);
  if (fs.existsSync(postPath)) {
    return fs.statSync(postPath).mtime;
  }
  return getValidDate(fallbackDate, new Date());
};

const getToolsLastModified = (): Date => {
  if (fs.existsSync(toolsConfigPath)) {
    return fs.statSync(toolsConfigPath).mtime;
  }
  return new Date();
};

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.frontmatter.slug}`,
    lastModified: getPostLastModified(post.frontmatter.slug, post.frontmatter.date),
    changeFrequency: "monthly" as const,
    priority: 0.7
  }));

  const toolSlugs = getAllToolSlugs();
  const toolsLastModified = getToolsLastModified();
  const toolUrls = toolSlugs.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: toolsLastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85
  }));

  const staticUrls = getStaticRoutes().map(({ route, lastModified }) => {
    const meta = STATIC_ROUTE_OVERRIDES[route] ?? DEFAULT_STATIC_META;
    return {
      url: route === "/" ? baseUrl : `${baseUrl}${route}`,
      lastModified,
      changeFrequency: meta.changeFrequency,
      priority: meta.priority
    };
  });

  return [...staticUrls, ...blogUrls, ...toolUrls];
}
