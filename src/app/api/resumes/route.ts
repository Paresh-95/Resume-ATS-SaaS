import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extractResumeText, isSupportedResumeMime } from "@/lib/resume/parse";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      fileName: true,
      source: true,
      createdAt: true,
      _count: { select: { reports: true } },
    },
  });

  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const titleField = formData.get("title");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  if (!isSupportedResumeMime(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a PDF, DOCX, or TXT file." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawText: string;
  try {
    rawText = await extractResumeText(buffer, file.type);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to parse file" },
      { status: 422 },
    );
  }

  if (!rawText || rawText.trim().length < 30) {
    return NextResponse.json(
      { error: "Couldn't extract readable text from this file. Try a different export/format." },
      { status: 422 },
    );
  }

  const title = typeof titleField === "string" && titleField.trim() ? titleField.trim() : file.name;

  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      title,
      fileName: file.name,
      mimeType: file.type,
      rawText,
      source: "UPLOAD",
    },
    select: { id: true, title: true, fileName: true, createdAt: true },
  });

  return NextResponse.json({ resume });
}
