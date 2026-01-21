import type { ConversionResponse } from "./types";

const MAMMOTH_VERSION = "1.8.0";
const MAMMOTH_SRC = `https://cdnjs.cloudflare.com/ajax/libs/mammoth/${MAMMOTH_VERSION}/mammoth.browser.min.js`;

let mammothPromise: Promise<any> | null = null;

const loadMammoth = async (): Promise<any> => {
  if (typeof window === "undefined") {
    throw new Error("DOCX conversion is only available in the browser.");
  }

  const existing = (window as { mammoth?: any }).mammoth;
  if (existing) {
    return existing;
  }

  if (!mammothPromise) {
    mammothPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = MAMMOTH_SRC;
      script.async = true;
      script.dataset.mammoth = "true";

      script.onload = () => {
        const mammoth = (window as { mammoth?: any }).mammoth;
        if (!mammoth) {
          reject(new Error("DOCX parser failed to load."));
          return;
        }
        resolve(mammoth);
      };

      script.onerror = () => {
        reject(new Error("Failed to load DOCX parser."));
      };

      document.head.appendChild(script);
    });
  }

  return mammothPromise;
};

const htmlToMarkdown = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const lines: string[] = [];

  const processNode = (node: Node, listDepth = 0, listType: "ul" | "ol" | null = null, listIndex = 1): number => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (text.trim()) {
        lines.push(text);
      }
      return listIndex;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return listIndex;
    }

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case "h1":
        lines.push(`# ${el.textContent?.trim() || ""}`);
        lines.push("");
        break;

      case "h2":
        lines.push(`## ${el.textContent?.trim() || ""}`);
        lines.push("");
        break;

      case "h3":
        lines.push(`### ${el.textContent?.trim() || ""}`);
        lines.push("");
        break;

      case "h4":
        lines.push(`#### ${el.textContent?.trim() || ""}`);
        lines.push("");
        break;

      case "h5":
        lines.push(`##### ${el.textContent?.trim() || ""}`);
        lines.push("");
        break;

      case "h6":
        lines.push(`###### ${el.textContent?.trim() || ""}`);
        lines.push("");
        break;

      case "p": {
        const content = processInlineContent(el);
        if (content.trim()) {
          lines.push(content);
          lines.push("");
        }
        break;
      }

      case "ul": {
        let idx = 1;
        el.childNodes.forEach((child) => {
          idx = processNode(child, listDepth + 1, "ul", idx);
        });
        if (listDepth === 0) {
          lines.push("");
        }
        break;
      }

      case "ol": {
        let idx = 1;
        el.childNodes.forEach((child) => {
          idx = processNode(child, listDepth + 1, "ol", idx);
        });
        if (listDepth === 0) {
          lines.push("");
        }
        break;
      }

      case "li": {
        const indent = "  ".repeat(Math.max(0, listDepth - 1));
        const content = processInlineContent(el);
        if (listType === "ol") {
          lines.push(`${indent}${listIndex}. ${content}`);
          return listIndex + 1;
        } else {
          lines.push(`${indent}- ${content}`);
        }
        break;
      }

      case "blockquote": {
        const content = el.textContent?.trim() || "";
        const quotedLines = content.split("\n").map((line) => `> ${line}`);
        lines.push(...quotedLines);
        lines.push("");
        break;
      }

      case "pre":
      case "code": {
        const content = el.textContent || "";
        if (tag === "pre" || content.includes("\n")) {
          lines.push("```");
          lines.push(content);
          lines.push("```");
          lines.push("");
        } else {
          lines.push(`\`${content}\``);
        }
        break;
      }

      case "hr":
        lines.push("---");
        lines.push("");
        break;

      case "br":
        lines.push("");
        break;

      case "table": {
        const rows = el.querySelectorAll("tr");
        rows.forEach((row, rowIdx) => {
          const cells = row.querySelectorAll("th, td");
          const cellContents = Array.from(cells).map((cell) => cell.textContent?.trim() || "");
          lines.push(`| ${cellContents.join(" | ")} |`);
          if (rowIdx === 0 && row.querySelector("th")) {
            lines.push(`| ${cellContents.map(() => "---").join(" | ")} |`);
          }
        });
        lines.push("");
        break;
      }

      default: {
        el.childNodes.forEach((child) => {
          processNode(child, listDepth, listType, listIndex);
        });
      }
    }

    return listIndex;
  };

  const processInlineContent = (el: Element): string => {
    let result = "";

    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        result += child.textContent || "";
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as Element;
        const tag = childEl.tagName.toLowerCase();
        const content = processInlineContent(childEl);

        switch (tag) {
          case "strong":
          case "b":
            result += `**${content}**`;
            break;
          case "em":
          case "i":
            result += `*${content}*`;
            break;
          case "u":
            result += content;
            break;
          case "s":
          case "strike":
          case "del":
            result += `~~${content}~~`;
            break;
          case "code":
            result += `\`${content}\``;
            break;
          case "a": {
            const href = childEl.getAttribute("href") || "";
            result += `[${content}](${href})`;
            break;
          }
          case "sup":
            result += `^${content}^`;
            break;
          case "sub":
            result += `~${content}~`;
            break;
          case "br":
            result += "\n";
            break;
          default:
            result += content;
        }
      }
    });

    return result;
  };

  doc.body.childNodes.forEach((child) => {
    processNode(child);
  });

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

const estimatePages = (text: string): number => {
  const words = countWords(text);
  const wordsPerPage = 250;
  return Math.max(1, Math.ceil(words / wordsPerPage));
};

export const convertDocxToMarkdown = async (file: File): Promise<ConversionResponse> => {
  const mammoth = await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value as string;

  if (!html || html.trim().length === 0) {
    return {
      markdown: "",
      pages: 0,
      words: 0,
      characters: 0,
      sourceName: file.name
    };
  }

  const markdown = htmlToMarkdown(html);

  return {
    markdown,
    pages: estimatePages(markdown),
    words: countWords(markdown),
    characters: markdown.length,
    sourceName: file.name
  };
};
