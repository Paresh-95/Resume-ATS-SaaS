import { NextResponse } from "next/server";
import { z } from "zod";

import type { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scoreResume, type CombinedIssue } from "@/lib/ats/score";
import { runGeneralFeedback } from "@/lib/ai/chains";
import { isAiConfigured } from "@/lib/ai/model";
import { consumeUsage } from "@/lib/billing/usage";

const bodySchema = z.object({ resumeId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  const resume = await prisma.resume.findFirst({
    where: { id: parsed.data.resumeId, userId: session.user.id },
  });
  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const usage = await consumeUsage(session.user.id, "GENERAL_CHECK");
  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: `You've used all ${usage.limit} general checks included in your ${usage.plan} plan this month.`,
        upgradeRequired: true,
      },
      { status: 402 },
    );
  }

  const ruleScore = scoreResume(resume.rawText);

  let aiSummary: string | null = null;
  let aiToneAndClarity: string | null = null;
  let combinedIssues: CombinedIssue[] = ruleScore.issues.map((i) => ({ ...i, source: "rule" as const }));
  let combinedStrengths = [...ruleScore.strengths];
  let rawModelOutput: unknown = null;

  if (isAiConfigured()) {
    try {
      const feedback = await runGeneralFeedback(resume.rawText, ruleScore);
      aiSummary = feedback.summary;
      aiToneAndClarity = feedback.toneAndClarity;
      combinedIssues = [
        ...combinedIssues,
        ...feedback.suggestions.map((s) => ({ ...s, source: "ai" as const })),
      ];
      combinedStrengths = [...combinedStrengths, ...feedback.strengths];
      rawModelOutput = feedback;
    } catch (err) {
      console.error("AI general feedback failed, falling back to rule-based only:", err);
    }
  }

  const report = await prisma.report.create({
    data: {
      userId: session.user.id,
      resumeId: resume.id,
      type: "GENERAL",
      overallScore: ruleScore.overallScore,
      categoryScores: ruleScore.categoryScores,
      strengths: combinedStrengths,
      issues: combinedIssues as unknown as Prisma.InputJsonValue,
      rawModelOutput: rawModelOutput ? JSON.parse(JSON.stringify(rawModelOutput)) : undefined,
    },
  });

  return NextResponse.json({
    report: {
      id: report.id,
      type: report.type,
      overallScore: report.overallScore,
      categoryScores: ruleScore.categoryScores,
      maxCategoryScores: ruleScore.maxCategoryScores,
      strengths: combinedStrengths,
      issues: combinedIssues,
      stats: ruleScore.stats,
      aiSummary,
      aiToneAndClarity,
      aiEnabled: isAiConfigured(),
      createdAt: report.createdAt,
    },
    usage,
  });
}
