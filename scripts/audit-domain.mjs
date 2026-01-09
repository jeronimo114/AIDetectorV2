import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const TARGET = "veridict.com";
const IGNORED_FILES = new Set(["scripts/audit-domain.mjs"]);

const EXCLUDED_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "supabase",
  "public",
  "coverage",
  "dist",
  "build"
]);

const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);

const matches = [];

const walk = (entryPath) => {
  const stat = fs.statSync(entryPath);
  if (stat.isDirectory()) {
    const name = path.basename(entryPath);
    if (EXCLUDED_DIRS.has(name)) {
      return;
    }
    for (const entry of fs.readdirSync(entryPath)) {
      walk(path.join(entryPath, entry));
    }
    return;
  }

  if (!stat.isFile()) {
    return;
  }

  const relPath = path.relative(ROOT, entryPath);
  if (IGNORED_FILES.has(relPath)) {
    return;
  }

  const ext = path.extname(entryPath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) {
    return;
  }

  const content = fs.readFileSync(entryPath, "utf8");
  if (!content.includes(TARGET)) {
    return;
  }

  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (line.includes(TARGET)) {
      const trimmed = line.trim();
      const snippet = trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed;
      matches.push(`${relPath}:${index + 1} ${snippet}`);
    }
  });
};

walk(ROOT);

if (matches.length > 0) {
  console.error(`Found ${matches.length} ${TARGET} reference(s):`);
  matches.forEach((match) => {
    console.error(`- ${match}`);
  });
  process.exit(1);
}

console.log(`OK: No ${TARGET} references found.`);
