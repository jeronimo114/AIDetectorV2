export type Verdict = "Likely AI" | "Unclear" | "Likely Human";

export type Comparison = {
  verdict: {
    from: Verdict;
    to: Verdict;
    changed: boolean;
  };
  confidence: {
    from: number;
    to: number;
    delta: number;
  };
  signals: {
    added: string[];
    removed: string[];
    unchanged: string[];
  };
  textBlocks: {
    status: "unchanged" | "modified" | "added";
    text: string;
  }[];
};

const normalize = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const splitBlocks = (text: string) => {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs;
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((block) => block.trim())
    .filter(Boolean);

  return sentences.length > 0 ? sentences : [text.trim()];
};

export function compareVerdict(from: Verdict, to: Verdict) {
  return {
    from,
    to,
    changed: from !== to
  };
}

export function compareConfidence(from: number, to: number) {
  const delta = Math.round((to - from) * 100);
  return { from, to, delta };
}

export function compareSignals(previous: string[] = [], next: string[] = []) {
  const prevSet = new Set(previous);
  const nextSet = new Set(next);

  const added = next.filter((signal) => !prevSet.has(signal));
  const removed = previous.filter((signal) => !nextSet.has(signal));
  const unchanged = next.filter((signal) => prevSet.has(signal));

  return { added, removed, unchanged };
}

export function compareText(previousText: string, nextText: string) {
  const prevBlocks = splitBlocks(previousText);
  const nextBlocks = splitBlocks(nextText);

  const prevNormalized = prevBlocks.map(normalize);

  return nextBlocks.map((block, index) => {
    const current = normalize(block);
    const prevBlock = prevNormalized[index];

    if (!prevBlock) {
      return { status: "added" as const, text: block };
    }

    if (prevBlock === current) {
      return { status: "unchanged" as const, text: block };
    }

    return { status: "modified" as const, text: block };
  });
}

export function buildComparison(params: {
  previous: {
    verdict: Verdict;
    confidence: number;
    signals: string[];
    text: string;
  };
  next: {
    verdict: Verdict;
    confidence: number;
    signals: string[];
    text: string;
  };
}): Comparison {
  return {
    verdict: compareVerdict(params.previous.verdict, params.next.verdict),
    confidence: compareConfidence(params.previous.confidence, params.next.confidence),
    signals: compareSignals(params.previous.signals, params.next.signals),
    textBlocks: compareText(params.previous.text, params.next.text)
  };
}
