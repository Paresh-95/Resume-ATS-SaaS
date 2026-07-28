export const ACTION_VERBS = new Set([
  "achieved", "accelerated", "administered", "advised", "analyzed", "architected",
  "automated", "boosted", "budgeted", "built", "chaired", "championed", "coached",
  "collaborated", "conducted", "consolidated", "constructed", "coordinated",
  "created", "cut", "decreased", "delivered", "delegated", "deployed", "designed",
  "developed", "devised", "directed", "drove", "engineered", "enhanced",
  "established", "evaluated", "executed", "expanded", "facilitated", "forecasted",
  "founded", "generated", "grew", "guided", "headed", "identified", "implemented",
  "improved", "increased", "influenced", "initiated", "innovated", "instituted",
  "instructed", "integrated", "introduced", "launched", "led", "leveraged",
  "maintained", "managed", "mentored", "migrated", "minimized", "modernized",
  "monitored", "negotiated", "optimized", "orchestrated", "organized", "overhauled",
  "oversaw", "partnered", "pioneered", "planned", "presented", "prioritized",
  "produced", "programmed", "proposed", "provided", "published", "recruited",
  "redesigned", "reduced", "refactored", "researched", "resolved", "restructured",
  "revamped", "saved", "scaled", "shipped", "simplified", "solved", "spearheaded",
  "standardized", "streamlined", "strengthened", "supervised", "supported",
  "surpassed", "trained", "transformed", "translated", "unified", "upgraded",
  "validated", "won",
]);

export const WEAK_PHRASES = [
  "responsible for", "duties included", "worked on", "helped with",
  "in charge of", "tasked with", "assisted with", "involved in",
];

export const BUZZWORDS = new Set([
  "synergy", "synergies", "go-getter", "team player", "hard worker",
  "detail-oriented", "results-driven", "self-starter", "think outside the box",
  "dynamic", "passionate", "guru", "ninja", "rockstar", "ninja rockstar",
]);

export const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "so", "of", "in", "on",
  "at", "to", "for", "with", "by", "from", "up", "about", "into", "over",
  "after", "is", "are", "was", "were", "be", "been", "being", "have", "has",
  "had", "do", "does", "did", "will", "would", "shall", "should", "may",
  "might", "must", "can", "could", "this", "that", "these", "those", "as",
  "it", "its", "you", "your", "we", "our", "they", "their", "he", "she",
  "his", "her", "i", "me", "my", "mine", "us", "them", "not", "no", "any",
  "all", "some", "such", "than", "too", "very", "just", "also", "etc",
  "including", "include", "includes", "per", "using", "used", "use",
  "years", "year", "experience", "work", "working", "job", "role", "team",
  "ability", "strong", "excellent", "good", "new", "other", "more", "most",
  "who", "what", "when", "where", "why", "how", "which", "while", "within",
  "across", "each", "both", "there", "here", "out", "off", "under", "based",
]);

export const SECTION_PATTERNS: Record<string, RegExp> = {
  contact: /\b(email|phone|linkedin|github|portfolio)\b/i,
  summary: /\b(summary|professional summary|objective|profile|about me)\b/im,
  experience: /\b(experience|employment history|work history|professional experience)\b/im,
  education: /\b(education|academic background)\b/im,
  skills: /\b(skills|technical skills|core competencies|technologies)\b/im,
  projects: /\b(projects|personal projects|key projects)\b/im,
  certifications: /\b(certifications?|licenses?)\b/im,
};

export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
export const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
export const LINKEDIN_REGEX = /linkedin\.com\/[a-zA-Z0-9-_/]+/i;
export const URL_REGEX = /https?:\/\/[^\s)]+|www\.[^\s)]+/i;
export const METRIC_REGEX = /(\$[\d,.]+[kmb]?|\d+[.,]?\d*\s?%|\b\d{2,}\+?\b|\bx\d+\b|\d+x\b)/i;
export const BULLET_LINE_REGEX = /^\s*[-•*▪◦‣·]/;
