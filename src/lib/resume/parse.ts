import mammoth from "mammoth";

export type SupportedResumeMime =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain";

export function isSupportedResumeMime(mime: string): mime is SupportedResumeMime {
  return [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ].includes(mime);
}

export async function extractResumeText(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractFromPdf(buffer);
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractFromDocx(buffer);
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new Error(
    `Unsupported file type "${mimeType}". Please upload a PDF, DOCX, or TXT resume.`,
  );
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return normalizeText(result.text);
  } finally {
    await parser.destroy();
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return normalizeText(result.value);
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
