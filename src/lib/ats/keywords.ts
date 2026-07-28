import { STOPWORDS } from "./constants";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function isMeaningfulToken(token: string): boolean {
  if (token.length < 2) return false;
  if (STOPWORDS.has(token)) return false;
  if (/^\d+$/.test(token)) return false;
  return true;
}

/**
 * Extracts frequency-ranked unigrams + bigrams from text, filtering stopwords
 * and short/numeric noise. Good enough proxy for "important terms" without
 * needing a full NLP/NER pipeline.
 */
export function extractKeywords(text: string, topN = 40): string[] {
  const tokens = tokenize(text).filter(isMeaningfulToken);

  const freq = new Map<string, number>();

  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    freq.set(bigram, (freq.get(bigram) || 0) + 1);
  }

  return [...freq.entries()]
    .filter(([term, count]) => {
      const isBigram = term.includes(" ");
      return isBigram ? count >= 2 : count >= 1;
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([term]) => term);
}

export interface KeywordComparison {
  matched: string[];
  missing: string[];
  matchPercentage: number;
}

export function compareKeywords(
  resumeText: string,
  jobDescription: string,
): KeywordComparison {
  const jdKeywords = extractKeywords(jobDescription, 30);
  const resumeTokens = new Set(tokenize(resumeText));
  const resumeTextLower = resumeText.toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jdKeywords) {
    const present = keyword.includes(" ")
      ? resumeTextLower.includes(keyword)
      : resumeTokens.has(keyword);

    if (present) matched.push(keyword);
    else missing.push(keyword);
  }

  const matchPercentage =
    jdKeywords.length === 0
      ? 0
      : Math.round((matched.length / jdKeywords.length) * 100);

  return { matched, missing, matchPercentage };
}
