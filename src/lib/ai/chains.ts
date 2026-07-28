import { SystemMessage, HumanMessage } from "@langchain/core/messages";

import { getChatModel } from "./model";
import {
  generalFeedbackSchema,
  targetedAnalysisSchema,
  resumeGenerationSchema,
  type GeneralFeedback,
  type TargetedAnalysis,
  type ResumeGenerationResult,
} from "./schemas";
import type { RuleBasedScore } from "@/lib/ats/score";

const GENERAL_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume reviewer and professional resume writer, similar to services like Resume Worded or Jobscan. You give direct, specific, actionable feedback — never generic platitudes. Reference concrete lines/sections from the resume when possible.`;

const TARGETED_SYSTEM_PROMPT = `You are an expert recruiter and ATS specialist who compares resumes against specific job descriptions to score fit and find keyword/skill gaps. Be precise about what is missing versus present. Prioritize hard skills, tools, certifications, and years-of-experience requirements from the JD.`;

const GENERATION_SYSTEM_PROMPT = `You are an expert resume writer who tailors resumes to specific job descriptions while staying 100% truthful to the candidate's real experience. Never invent employers, titles, dates, or metrics that are not implied by the source resume. You may rephrase, reorder, emphasize, and incorporate JD terminology/synonyms where it genuinely reflects the candidate's existing experience.`;

export async function runGeneralFeedback(
  resumeText: string,
  ruleScore: RuleBasedScore,
): Promise<GeneralFeedback> {
  const model = await getChatModel({ temperature: 0.4 });
  const structured = model.withStructuredOutput(generalFeedbackSchema, {
    name: "general_feedback",
  });

  return (await structured.invoke([
    new SystemMessage(GENERAL_SYSTEM_PROMPT),
    new HumanMessage(
      `Here is a candidate's resume text:\n\n"""\n${resumeText}\n"""\n\n` +
        `An automated rule-based ATS scan already found:\n` +
        `- Overall rule score: ${ruleScore.overallScore}/100\n` +
        `- Category scores: ${JSON.stringify(ruleScore.categoryScores)}\n` +
        `- Detected issues: ${JSON.stringify(ruleScore.issues.map((i) => i.title))}\n\n` +
        `Now provide deeper qualitative feedback: overall summary, strengths, prioritized suggestions, and tone/clarity feedback. Do not just repeat the automated issues verbatim — add insight a human expert reviewer would add.`,
    ),
  ])) as GeneralFeedback;
}

export async function runTargetedAnalysis(
  resumeText: string,
  jobDescription: string,
  jobTitle?: string,
): Promise<TargetedAnalysis> {
  const model = await getChatModel({ temperature: 0.3 });
  const structured = model.withStructuredOutput(targetedAnalysisSchema, {
    name: "targeted_analysis",
  });

  return (await structured.invoke([
    new SystemMessage(TARGETED_SYSTEM_PROMPT),
    new HumanMessage(
      `Job title: ${jobTitle || "(not provided)"}\n\n` +
        `Job description:\n"""\n${jobDescription}\n"""\n\n` +
        `Candidate resume:\n"""\n${resumeText}\n"""\n\n` +
        `Score how well this resume matches this specific job description for ATS purposes and human recruiter screening. Identify matched vs missing keywords/skills, concrete gaps with fixes, and suggest example bullet points the candidate could add.`,
    ),
  ])) as TargetedAnalysis;
}

export async function runResumeGeneration(
  resumeText: string,
  jobDescription: string,
  jobTitle?: string,
): Promise<ResumeGenerationResult> {
  const model = await getChatModel({ temperature: 0.5 });
  const structured = model.withStructuredOutput(resumeGenerationSchema, {
    name: "resume_generation",
  });

  return (await structured.invoke([
    new SystemMessage(GENERATION_SYSTEM_PROMPT),
    new HumanMessage(
      `Job title: ${jobTitle || "(not provided)"}\n\n` +
        `Target job description:\n"""\n${jobDescription}\n"""\n\n` +
        `Candidate's existing resume:\n"""\n${resumeText}\n"""\n\n` +
        `Rewrite and tailor this resume for the target job description above. Keep it truthful to the candidate's real experience — do not fabricate employers, titles, dates, or numbers. Reorganize/rephrase bullets to foreground relevant experience, incorporate the JD's terminology and required keywords naturally, and keep standard ATS-friendly formatting (plain text, clear section headers, "-" bullet points, no tables/columns).`,
    ),
  ])) as ResumeGenerationResult;
}
