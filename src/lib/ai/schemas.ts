import { z } from "zod";

export const aiSuggestionSchema = z.object({
  title: z.string().describe("Short title of the issue or suggestion"),
  detail: z.string().describe("Concrete, actionable explanation"),
  severity: z.enum(["high", "medium", "low"]),
});

export const generalFeedbackSchema = z.object({
  summary: z
    .string()
    .describe("2-3 sentence overall assessment of the resume"),
  strengths: z.array(z.string()).describe("What the resume already does well"),
  suggestions: z
    .array(aiSuggestionSchema)
    .describe("Prioritized, actionable improvements"),
  toneAndClarity: z
    .string()
    .describe("Feedback on writing tone, clarity, and impact of bullet points"),
});
export type GeneralFeedback = z.infer<typeof generalFeedbackSchema>;

export const targetedAnalysisSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall percentage match between resume and job description"),
  summary: z.string().describe("2-3 sentence summary of fit for this role"),
  matchedKeywords: z
    .array(z.string())
    .describe("Important JD keywords/skills already present in the resume"),
  missingKeywords: z
    .array(z.string())
    .describe("Important JD keywords/skills absent from the resume"),
  gaps: z
    .array(aiSuggestionSchema)
    .describe("Specific gaps between resume and job requirements, with fixes"),
  recommendedBullets: z
    .array(z.string())
    .describe(
      "2-4 example resume bullet points the candidate could add/adapt to better match this JD",
    ),
});
export type TargetedAnalysis = z.infer<typeof targetedAnalysisSchema>;

export const resumeGenerationSchema = z.object({
  resumeText: z
    .string()
    .describe(
      "The full tailored resume as plain text, preserving section structure (headers in ALL CAPS, bullet points with '-'), ready to copy into a document",
    ),
  changesSummary: z
    .array(z.string())
    .describe("Bullet list of what was changed or emphasized and why"),
  addedKeywords: z
    .array(z.string())
    .describe("JD keywords that were newly incorporated into the resume"),
});
export type ResumeGenerationResult = z.infer<typeof resumeGenerationSchema>;
