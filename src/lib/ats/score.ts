import {
  ACTION_VERBS,
  WEAK_PHRASES,
  BUZZWORDS,
  SECTION_PATTERNS,
  EMAIL_REGEX,
  PHONE_REGEX,
  LINKEDIN_REGEX,
  URL_REGEX,
  METRIC_REGEX,
  BULLET_LINE_REGEX,
} from "./constants";
import { extractKeywords } from "./keywords";

export type IssueSeverity = "high" | "medium" | "low";

export interface ScoreIssue {
  severity: IssueSeverity;
  title: string;
  detail: string;
  section?: string;
}

export type CombinedIssue = ScoreIssue & { source: "rule" | "ai" };

export interface RuleBasedScore {
  overallScore: number;
  categoryScores: {
    contactInfo: number;
    sectionStructure: number;
    formatting: number;
    actionVerbs: number;
    quantifiedImpact: number;
    keywordDiversity: number;
    lengthConciseness: number;
  };
  maxCategoryScores: {
    contactInfo: 10;
    sectionStructure: 15;
    formatting: 15;
    actionVerbs: 20;
    quantifiedImpact: 20;
    keywordDiversity: 10;
    lengthConciseness: 10;
  };
  issues: ScoreIssue[];
  strengths: string[];
  stats: {
    wordCount: number;
    bulletCount: number;
    strongBulletRatio: number;
    quantifiedBulletRatio: number;
    distinctKeywordCount: number;
  };
}

const MAX_SCORES = {
  contactInfo: 10,
  sectionStructure: 15,
  formatting: 15,
  actionVerbs: 20,
  quantifiedImpact: 20,
  keywordDiversity: 10,
  lengthConciseness: 10,
} as const;

function getBulletLines(text: string): string[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const explicitBullets = lines.filter((l) => BULLET_LINE_REGEX.test(l));
  if (explicitBullets.length >= 3) return explicitBullets;

  // Fallback: treat reasonably-sized sentence-like lines as pseudo-bullets
  return lines.filter(
    (l) => l.length > 25 && l.length < 300 && !SECTION_PATTERNS.skills.test(l),
  );
}

function stripBulletMarker(line: string): string {
  return line.replace(BULLET_LINE_REGEX, "").trim();
}

function scoreContactInfo(text: string, issues: ScoreIssue[]): number {
  let score = 0;
  const hasEmail = EMAIL_REGEX.test(text);
  const hasPhone = PHONE_REGEX.test(text);
  const hasLinkOrUrl = LINKEDIN_REGEX.test(text) || URL_REGEX.test(text);

  if (hasEmail) score += 4;
  else
    issues.push({
      severity: "high",
      title: "No email address detected",
      detail:
        "ATS systems and recruiters expect a clearly visible email address at the top of your resume.",
      section: "Contact",
    });

  if (hasPhone) score += 3;
  else
    issues.push({
      severity: "medium",
      title: "No phone number detected",
      detail: "Add a phone number so recruiters can reach you directly.",
      section: "Contact",
    });

  if (hasLinkOrUrl) score += 3;
  else
    issues.push({
      severity: "low",
      title: "No LinkedIn or portfolio link found",
      detail:
        "Adding a LinkedIn profile or portfolio/GitHub link gives recruiters more context and signals credibility.",
      section: "Contact",
    });

  return score;
}

function scoreSectionStructure(text: string, issues: ScoreIssue[], strengths: string[]): number {
  let score = 0;
  const hasExperience = SECTION_PATTERNS.experience.test(text);
  const hasEducation = SECTION_PATTERNS.education.test(text);
  const hasSkills = SECTION_PATTERNS.skills.test(text);
  const hasSummary = SECTION_PATTERNS.summary.test(text);

  if (hasExperience) score += 6;
  else
    issues.push({
      severity: "high",
      title: "No clear \"Experience\" section header found",
      detail:
        "ATS parsers rely on standard section headers. Use a clear heading like \"Experience\" or \"Work Experience\".",
      section: "Structure",
    });

  if (hasEducation) score += 4;
  else
    issues.push({
      severity: "medium",
      title: "No clear \"Education\" section header found",
      detail: "Add a dedicated Education section, even if brief.",
      section: "Structure",
    });

  if (hasSkills) score += 5;
  else
    issues.push({
      severity: "high",
      title: "No clear \"Skills\" section found",
      detail:
        "A dedicated Skills section makes it much easier for ATS keyword scans and recruiters to find your core competencies.",
      section: "Structure",
    });

  if (hasSummary) strengths.push("Includes a professional summary/objective section.");

  return score;
}

function scoreFormatting(text: string, bullets: string[], issues: ScoreIssue[], strengths: string[]): number {
  let score = 0;
  const lines = text.split("\n").filter((l) => l.trim());
  const explicitBulletLines = lines.filter((l) => BULLET_LINE_REGEX.test(l));
  const bulletRatio = lines.length > 0 ? explicitBulletLines.length / lines.length : 0;

  if (bulletRatio > 0.15) {
    score += 8;
    strengths.push("Uses bullet points consistently, which is easy for ATS parsers to read.");
  } else if (bulletRatio > 0.05) {
    score += 4;
    issues.push({
      severity: "medium",
      title: "Inconsistent use of bullet points",
      detail: "Use \"-\" or \"•\" bullet points consistently for experience/achievement lines instead of paragraphs.",
      section: "Formatting",
    });
  } else {
    issues.push({
      severity: "high",
      title: "Little to no bullet point formatting detected",
      detail:
        "Resumes written as paragraphs are harder for ATS systems and recruiters to scan. Convert achievements into concise bullet points.",
      section: "Formatting",
    });
  }

  const pipeCount = (text.match(/\|/g) || []).length;
  const tabCount = (text.match(/\t/g) || []).length;
  if (pipeCount > 20 || tabCount > 20) {
    issues.push({
      severity: "medium",
      title: "Possible table or multi-column layout detected",
      detail:
        "Tables, text boxes, and multi-column layouts often get scrambled or dropped by ATS parsers. Use a single-column, linear layout.",
      section: "Formatting",
    });
  } else {
    score += 4;
  }

  if (lines.length >= 10) {
    score += 3;
  } else {
    issues.push({
      severity: "medium",
      title: "Resume text looks unusually short or unstructured",
      detail: "Ensure your resume has clearly separated lines/sections rather than dense blocks of text.",
      section: "Formatting",
    });
  }

  return score;
}

function scoreActionVerbs(bullets: string[], issues: ScoreIssue[], strengths: string[]): { score: number; ratio: number } {
  if (bullets.length === 0) {
    issues.push({
      severity: "high",
      title: "No bullet points detected to evaluate",
      detail: "Add bullet points describing your responsibilities and achievements.",
      section: "Experience",
    });
    return { score: 0, ratio: 0 };
  }

  let strongCount = 0;
  let weakPhraseCount = 0;

  for (const bullet of bullets) {
    const cleaned = stripBulletMarker(bullet).toLowerCase();
    const firstWord = cleaned.split(/\s+/)[0]?.replace(/[^a-z]/g, "");
    if (firstWord && ACTION_VERBS.has(firstWord)) strongCount++;

    for (const phrase of WEAK_PHRASES) {
      if (cleaned.includes(phrase)) weakPhraseCount++;
    }
  }

  const ratio = strongCount / bullets.length;
  const score = Math.round(ratio * 20);

  if (ratio >= 0.6) {
    strengths.push("Most bullet points start with strong action verbs.");
  } else {
    issues.push({
      severity: "high",
      title: "Many bullet points don't start with a strong action verb",
      detail: `Only ${Math.round(ratio * 100)}% of your bullet points start with an action verb like "Led", "Built", or "Increased". Rewrite bullets to lead with impact-driven verbs.`,
      section: "Experience",
    });
  }

  if (weakPhraseCount > 0) {
    issues.push({
      severity: "medium",
      title: 'Weak filler phrases detected (e.g. "responsible for")',
      detail:
        'Replace passive phrases like "responsible for" or "worked on" with direct action verbs describing what you actually did and achieved.',
      section: "Experience",
    });
  }

  return { score, ratio };
}

function scoreQuantifiedImpact(bullets: string[], issues: ScoreIssue[], strengths: string[]): { score: number; ratio: number } {
  if (bullets.length === 0) return { score: 0, ratio: 0 };

  const quantified = bullets.filter((b) => METRIC_REGEX.test(b));
  const ratio = quantified.length / bullets.length;
  const score = Math.round(ratio * 20);

  if (ratio >= 0.4) {
    strengths.push("Strong use of numbers and metrics to quantify impact.");
  } else {
    issues.push({
      severity: "high",
      title: "Few bullet points include measurable results",
      detail:
        `Only ${Math.round(ratio * 100)}% of your bullets include a number, percentage, or metric. Quantify impact wherever possible (e.g. "reduced load time by 40%", "managed a team of 8").`,
      section: "Experience",
    });
  }

  return { score, ratio };
}

function scoreKeywordDiversity(text: string, issues: ScoreIssue[]): { score: number; distinctCount: number } {
  const keywords = extractKeywords(text, 60);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const density = wordCount > 0 ? keywords.length / (wordCount / 100) : 0;

  let score = Math.min(10, Math.round((density / 8) * 10));

  let buzzwordHits = 0;
  const lowerText = text.toLowerCase();
  for (const buzz of BUZZWORDS) {
    if (lowerText.includes(buzz)) buzzwordHits++;
  }

  if (buzzwordHits > 0) {
    score = Math.max(0, score - Math.min(4, buzzwordHits * 2));
    issues.push({
      severity: "low",
      title: "Generic buzzwords detected",
      detail:
        'Vague buzzwords like "team player" or "results-driven" add little signal for ATS or recruiters. Replace with concrete, specific achievements.',
      section: "Wording",
    });
  }

  return { score, distinctCount: keywords.length };
}

function scoreLength(text: string, issues: ScoreIssue[]): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (wordCount >= 350 && wordCount <= 1100) return 10;

  if (wordCount < 350) {
    issues.push({
      severity: "medium",
      title: "Resume may be too short",
      detail: `At ~${wordCount} words, your resume may be missing detail recruiters and ATS keyword scans look for. Aim for roughly 400-900 words (1-2 pages).`,
      section: "Length",
    });
    return Math.round((wordCount / 350) * 10);
  }

  issues.push({
    severity: "low",
    title: "Resume may be too long",
    detail: `At ~${wordCount} words, your resume is likely longer than 2 pages. Trim to the most relevant, recent, and impactful experience.`,
    section: "Length",
  });
  return Math.max(4, 10 - Math.round((wordCount - 1100) / 200));
}

export function scoreResume(text: string): RuleBasedScore {
  const issues: ScoreIssue[] = [];
  const strengths: string[] = [];
  const bullets = getBulletLines(text);

  const contactInfo = scoreContactInfo(text, issues);
  const sectionStructure = scoreSectionStructure(text, issues, strengths);
  const formatting = scoreFormatting(text, bullets, issues, strengths);
  const { score: actionVerbs, ratio: strongBulletRatio } = scoreActionVerbs(bullets, issues, strengths);
  const { score: quantifiedImpact, ratio: quantifiedBulletRatio } = scoreQuantifiedImpact(bullets, issues, strengths);
  const { score: keywordDiversity, distinctCount } = scoreKeywordDiversity(text, issues);
  const lengthConciseness = scoreLength(text, issues);

  const categoryScores = {
    contactInfo,
    sectionStructure,
    formatting,
    actionVerbs,
    quantifiedImpact,
    keywordDiversity,
    lengthConciseness,
  };

  const overallScore = Object.values(categoryScores).reduce((a, b) => a + b, 0);

  const severityWeight: Record<IssueSeverity, number> = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => severityWeight[a.severity] - severityWeight[b.severity]);

  return {
    overallScore: Math.round(overallScore),
    categoryScores,
    maxCategoryScores: MAX_SCORES,
    issues,
    strengths,
    stats: {
      wordCount: text.split(/\s+/).filter(Boolean).length,
      bulletCount: bullets.length,
      strongBulletRatio,
      quantifiedBulletRatio,
      distinctKeywordCount: distinctCount,
    },
  };
}
