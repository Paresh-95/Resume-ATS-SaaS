import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runResumeGeneration } from "@/lib/ai/chains";
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

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI resume generation requires an LLM provider to be configured (set MODEL_PROVIDER + the matching API key in .env).",
      },
      { status: 501 },
    );
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

  const usage = await consumeUsage(session.user.id, "GENERATION");
  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: `You've used all ${usage.limit} AI resume generations included in your ${usage.plan} plan this month.`,
        upgradeRequired: true,
      },
      { status: 402 },
    );
  }

  let result;
  try {
    result = await runResumeGeneration(resume.rawText, jobDescription, jobTitle);
  } catch (err) {
    console.error("Resume generation failed:", err);
    return NextResponse.json(
      { error: "Resume generation failed. Please try again." },
      { status: 502 },
    );
  }

  const generation = await prisma.resumeGeneration.create({
    data: {
      userId: session.user.id,
      sourceResumeId: resume.id,
      jobTitle: jobTitle || null,
      jobDescription,
      generatedText: result.resumeText,
      summary: {
        changes: result.changesSummary,
        addedKeywords: result.addedKeywords,
      },
    },
  });

  return NextResponse.json({
    generation: {
      id: generation.id,
      resumeText: result.resumeText,
      changesSummary: result.changesSummary,
      addedKeywords: result.addedKeywords,
      createdAt: generation.createdAt,
    },
    usage,
  });
}
