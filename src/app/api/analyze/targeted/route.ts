import { NextResponse } from "next/server";
import { z } from "zod";

import type { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scoreResume, type CombinedIssue } from "@/lib/ats/score";
import { compareKeywords } from "@/lib/ats/keywords";
import { runTargetedAnalysis } from "@/lib/ai/chains";
import { isAiConfigured } from "@/lib/ai/model";
import { consumeUsage } from "@/lib/billing/usage";

const bodySchema = z.object({
  resumeId: z.string().min(1),
  jobDescription: z.string().min(50, "Paste the full job description (at least a few sentences)."),
  jobTitle: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }

  const { resumeId, jobDescription, jobTitle } = parsed.data;

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId: session.user.id },
  });
  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const usage = await consumeUsage(session.user.id, "TARGETED_CHECK");
  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: `You've used all ${usage.limit} targeted checks included in your ${usage.plan} plan this month.`,
        upgradeRequired: true,
      },
      { status: 402 },
    );
  }

  const ruleScore = scoreResume(resume.rawText);
  const keywordComparison = compareKeywords(resume.rawText, jobDescription);

  let overallScore = keywordComparison.matchPercentage;
  let matchedKeywords = keywordComparison.matched;
  let missingKeywords = keywordComparison.missing;
  let summary = `Your resume matches ${keywordComparison.matchPercentage}% of the key terms found in this job description.`;
  let gaps: CombinedIssue[] = ruleScore.issues.map((i) => ({ ...i, source: "rule" as const }));
  let recommendedBullets: string[] = [];
  let rawModelOutput: unknown = null;

  if (isAiConfigured()) {
    try {
      const analysis = await runTargetedAnalysis(resume.rawText, jobDescription, jobTitle);
      overallScore = analysis.matchScore;
      matchedKeywords = analysis.matchedKeywords.length ? analysis.matchedKeywords : matchedKeywords;
      missingKeywords = analysis.missingKeywords.length ? analysis.missingKeywords : missingKeywords;
      summary = analysis.summary;
      gaps = [...gaps, ...analysis.gaps.map((g) => ({ ...g, source: "ai" as const }))];
      recommendedBullets = analysis.recommendedBullets;
      rawModelOutput = analysis;
    } catch (err) {
      console.error("AI targeted analysis failed, falling back to keyword-based only:", err);
    }
  }

  const report = await prisma.report.create({
    data: {
      userId: session.user.id,
      resumeId: resume.id,
      type: "TARGETED",
      jobTitle: jobTitle || null,
      jobDescription,
      overallScore: Math.round(overallScore),
      categoryScores: ruleScore.categoryScores,
      strengths: ruleScore.strengths,
      issues: gaps as unknown as Prisma.InputJsonValue,
      missingKeywords,
      matchedKeywords,
      rawModelOutput: rawModelOutput ? JSON.parse(JSON.stringify(rawModelOutput)) : undefined,
    },
  });

  return NextResponse.json({
    report: {
      id: report.id,
      type: report.type,
      jobTitle: report.jobTitle,
      overallScore: report.overallScore,
      matchedKeywords,
      missingKeywords,
      summary,
      gaps,
      recommendedBullets,
      ruleScore,
      aiEnabled: isAiConfigured(),
      createdAt: report.createdAt,
    },
    usage,
  });
}
