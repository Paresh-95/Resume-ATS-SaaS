"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, FileEdit, Copy, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ResumeSelector } from "@/components/dashboard/resume-selector";

interface Generation {
  resumeText: string;
  changesSummary: string[];
  addedKeywords: string[];
}

export default function GenerateResumePage() {
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState<Generation | null>(null);

  async function runGeneration() {
    if (!resumeId) {
      toast.error("Select or upload a resume first.");
      return;
    }
    if (jobDescription.trim().length < 50) {
      toast.error("Paste the full job description (at least a few sentences).");
      return;
    }

    setLoading(true);
    setGeneration(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription, jobTitle: jobTitle || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to generate resume");
        return;
      }

      setGeneration(data.generation);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (!generation) return;
    navigator.clipboard.writeText(generation.resumeText);
    toast.success("Copied to clipboard");
  }

  function downloadAsTxt() {
    if (!generation) return;
    const blob = new Blob([generation.resumeText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tailored-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold tracking-tight">
          <FileEdit className="size-6 text-primary" />
          AI Resume Generator
        </h1>
        <p className="mt-1 text-muted-foreground">
          Rewrite your existing resume tailored to a specific job description — truthfully, using your real experience.
        </p>
      </div>

      <Card className="space-y-4 p-6">
        <ResumeSelector value={resumeId} onChange={setResumeId} />

        <div className="space-y-1.5">
          <Label htmlFor="jobTitle">Job title (optional)</Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Product Manager"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="jobDescription">Target job description</Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-48"
          />
        </div>

        <Button className="gap-2" onClick={runGeneration} disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Generating..." : "Generate tailored resume"}
        </Button>
      </Card>

      {generation && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Tailored resume</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={copyToClipboard}>
                  <Copy className="size-3.5" /> Copy
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={downloadAsTxt}>
                  <Download className="size-3.5" /> Download .txt
                </Button>
              </div>
            </div>
            <Textarea
              readOnly
              value={generation.resumeText}
              className="mt-3 min-h-96 font-mono text-xs leading-relaxed"
            />
          </Card>

          {generation.addedKeywords.length > 0 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold">Keywords incorporated</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {generation.addedKeywords.map((kw) => (
                  <Badge key={kw} variant="secondary">{kw}</Badge>
                ))}
              </div>
            </Card>
          )}

          {generation.changesSummary.length > 0 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold">What changed</h2>
              <ul className="mt-3 space-y-2">
                {generation.changesSummary.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
