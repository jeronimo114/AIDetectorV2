import type { ConversionResponse } from "./types";

type PdfTextItem = {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
};

type LineItem = {
  text: string;
  x: number;
  width: number;
  fontSize: number;
};

type PdfLine = {
  text: string;
  fontSize: number;
};

const PDFJS_VERSION = "3.11.174";
const PDFJS_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

let pdfJsPromise: Promise<any> | null = null;

const loadPdfJs = async (): Promise<any> => {
  if (typeof window === "undefined") {
    throw new Error("PDF conversion is only available in the browser.");
  }

  const existing = (window as { pdfjsLib?: any }).pdfjsLib;
  if (existing) {
    existing.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
    return existing;
  }

  if (!pdfJsPromise) {
    pdfJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = PDFJS_SRC;
      script.async = true;
      script.dataset.pdfjs = "true";

      script.onload = () => {
        const pdfjsLib = (window as { pdfjsLib?: any }).pdfjsLib;
        if (!pdfjsLib) {
          reject(new Error("PDF parser failed to load."));
          return;
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
        resolve(pdfjsLib);
      };

      script.onerror = () => {
        reject(new Error("Failed to load PDF parser."));
      };

      document.head.appendChild(script);
    });
  }

  return pdfJsPromise;
};

const getMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const normalizeSpacing = (text: string) => text.replace(/\s+/g, " ").trim();

const parseBulletLine = (text: string): string | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const firstChar = trimmed[0];
  const charCode = firstChar.charCodeAt(0);
  if (firstChar !== "-" && firstChar !== "*" && charCode !== 8226 && charCode !== 183) {
    return null;
  }
  const rest = trimmed.slice(1).trim();
  return rest.length > 0 ? rest : null;
};

const parseOrderedLine = (text: string): { index: string; content: string } | null => {
  const match = text.trim().match(/^(\d+)[.)]\s+(.*)$/);
  if (!match) return null;
  return { index: match[1], content: match[2].trim() };
};

const looksLikeHeading = (text: string, fontSize: number, medianSize: number) => {
  if (!medianSize || fontSize < medianSize * 1.2) return false;
  if (text.length > 80) return false;
  const words = text.split(/\s+/);
  if (words.length > 12) return false;
  if (/[.!?]$/.test(text)) return false;
  return true;
};

const joinLineItems = (items: LineItem[]) => {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  let line = "";
  let lastX = 0;
  let lastWidth = 0;
  let fontTotal = 0;
  let fontCount = 0;

  sorted.forEach((item, index) => {
    const spacing = index === 0 ? 0 : item.x - (lastX + lastWidth);
    const spaceThreshold = Math.max(1, item.fontSize * 0.25);
    if (index > 0 && spacing > spaceThreshold && !line.endsWith(" ")) {
      line += " ";
    }
    line += item.text;
    lastX = item.x;
    lastWidth = item.width || item.text.length * (item.fontSize * 0.5 || 1);
    fontTotal += item.fontSize;
    fontCount += 1;
  });

  return { text: normalizeSpacing(line), fontSize: fontCount > 0 ? fontTotal / fontCount : 0 };
};

const extractLinesFromItems = (items: PdfTextItem[]) => {
  const buckets = new Map<number, { y: number; items: LineItem[] }>();
  const tolerance = 2;

  items.forEach((item) => {
    if (!item.str || !item.str.trim()) return;
    const transform = item.transform || [];
    const x = transform[4] ?? 0;
    const y = transform[5] ?? 0;
    const fontSize = Math.max(Math.abs(transform[0] ?? 0), Math.abs(transform[3] ?? 0));
    const key = Math.round(y / tolerance);

    const entry = buckets.get(key) || { y, items: [] };
    entry.items.push({
      text: item.str,
      x,
      width: item.width ?? 0,
      fontSize
    });
    buckets.set(key, entry);
  });

  return [...buckets.values()]
    .sort((a, b) => b.y - a.y)
    .map((bucket) => joinLineItems(bucket.items))
    .filter((line) => line.text.length > 0);
};

const buildMarkdown = (lines: PdfLine[]) => {
  const fontSizes = lines.map((line) => line.fontSize).filter((size) => size > 0);
  const medianSize = getMedian(fontSizes);
  const mdLines: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    mdLines.push(paragraph.join(" "));
    mdLines.push("");
    paragraph = [];
  };

  lines.forEach((line) => {
    const text = normalizeSpacing(line.text);
    if (!text) {
      flushParagraph();
      return;
    }

    const bullet = parseBulletLine(text);
    if (bullet) {
      flushParagraph();
      mdLines.push(`- ${bullet}`);
      return;
    }

    const ordered = parseOrderedLine(text);
    if (ordered) {
      flushParagraph();
      mdLines.push(`${ordered.index}. ${ordered.content}`);
      return;
    }

    if (looksLikeHeading(text, line.fontSize, medianSize)) {
      flushParagraph();
      const level = line.fontSize >= medianSize * 1.5 ? 1 : 2;
      mdLines.push(`${"#".repeat(level)} ${text}`);
      mdLines.push("");
      return;
    }

    if (paragraph.length > 0) {
      const previous = paragraph[paragraph.length - 1];
      if (previous.endsWith("-") && /^[a-z]/.test(text)) {
        paragraph[paragraph.length - 1] = previous.slice(0, -1) + text;
      } else {
        paragraph.push(text);
      }
    } else {
      paragraph.push(text);
    }
  });

  flushParagraph();
  return mdLines.join("\n").trim();
};

const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

export const convertPdfToMarkdown = async (file: File): Promise<ConversionResponse> => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines: PdfLine[] = [];

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const textContent = await page.getTextContent();
    const pageLines = extractLinesFromItems(textContent.items as PdfTextItem[]);
    lines.push(...pageLines);
    lines.push({ text: "", fontSize: 0 });
  }

  const markdown = buildMarkdown(lines);
  return {
    markdown,
    pages: pdf.numPages,
    words: countWords(markdown),
    characters: markdown.length,
    sourceName: file.name
  };
};
