"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ScanLine, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ResumeSelector } from "@/components/dashboard/resume-selector";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { IssueList, type DisplayIssue } from "@/components/dashboard/issue-list";

const CATEGORY_LABELS: Record<string, string> = {
  contactInfo: "Contact info",
  sectionStructure: "Section structure",
  formatting: "Formatting",
  actionVerbs: "Action verbs",
  quantifiedImpact: "Quantified impact",
  keywordDiversity: "Keyword diversity",
  lengthConciseness: "Length & conciseness",
};

interface GeneralReport {
  overallScore: number;
  categoryScores: Record<string, number>;
  maxCategoryScores: Record<string, number>;
  strengths: string[];
  issues: DisplayIssue[];
  aiSummary: string | null;
  aiToneAndClarity: string | null;
  aiEnabled: boolean;
}

export default function GeneralCheckPage() {
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GeneralReport | null>(null);

  async function runCheck() {
    if (!resumeId) {
      toast.error("Select or upload a resume first.");
      return;
    }

    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/analyze/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to run check");
        return;
      }

      setReport(data.report);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold tracking-tight">
          <ScanLine className="size-6 text-primary" />
          General ATS Check
        </h1>
        <p className="mt-1 text-muted-foreground">
          Score your resume against the formatting, structure, and content rules ATS systems and recruiters actually apply.
        </p>
      </div>

      <Card className="p-6">
        <ResumeSelector value={resumeId} onChange={setResumeId} />
        <Button className="mt-4 gap-2" onClick={runCheck} disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Analyzing..." : "Run ATS Check"}
        </Button>
      </Card>

      {report && (
        <div className="space-y-6">
          <Card className="flex flex-col items-center gap-6 p-6 sm:flex-row">
            <ScoreGauge score={report.overallScore} />
            <div className="flex-1 space-y-3">
              {report.aiSummary && (
                <p className="text-sm text-muted-foreground">{report.aiSummary}</p>
              )}
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {Object.entries(report.categoryScores).map(([key, score]) => {
                  const max = report.maxCategoryScores[key] || 100;
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{CATEGORY_LABELS[key] || key}</span>
                        <span className="font-medium">{score}/{max}</span>
                      </div>
                      <Progress value={(score / max) * 100} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {report.strengths.length > 0 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold">Strengths</h2>
              <ul className="mt-3 space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {report.aiToneAndClarity && (
            <Card className="p-6">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Sparkles className="size-4 text-primary" /> Tone & clarity
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">{report.aiToneAndClarity}</p>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-sm font-semibold">Issues & suggestions</h2>
            <div className="mt-3">
              <IssueList issues={report.issues} />
            </div>
          </Card>

          {!report.aiEnabled && (
            <p className="text-xs text-muted-foreground">
              AI-powered deeper feedback is disabled — configure an LLM provider in .env to unlock qualitative suggestions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
