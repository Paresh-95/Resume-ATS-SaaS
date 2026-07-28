"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Target, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ResumeSelector } from "@/components/dashboard/resume-selector";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { IssueList, type DisplayIssue } from "@/components/dashboard/issue-list";

interface TargetedReport {
  overallScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  summary: string;
  gaps: DisplayIssue[];
  recommendedBullets: string[];
  aiEnabled: boolean;
}

export default function TargetedCheckPage() {
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<TargetedReport | null>(null);

  async function runCheck() {
    if (!resumeId) {
      toast.error("Select or upload a resume first.");
      return;
    }
    if (jobDescription.trim().length < 50) {
      toast.error("Paste the full job description (at least a few sentences).");
      return;
    }

    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/analyze/targeted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription, jobTitle: jobTitle || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to run targeted check");
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
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Target className="size-6 text-primary" />
          Targeted JD Match
        </h1>
        <p className="mt-1 text-muted-foreground">
          Paste a job description to see exactly how well your resume matches — and what's missing.
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
          <Label htmlFor="jobDescription">Job description</Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-48"
          />
        </div>

        <Button className="gap-2" onClick={runCheck} disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Analyzing..." : "Run Targeted Check"}
        </Button>
      </Card>

      {report && (
        <div className="space-y-6">
          <Card className="flex flex-col items-center gap-6 p-6 sm:flex-row">
            <ScoreGauge score={report.overallScore} />
            <div className="flex-1">
              <p className="text-sm font-medium">Match score</p>
              <p className="mt-1 text-sm text-muted-foreground">{report.summary}</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card className="p-6">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <CheckCircle2 className="size-4 text-primary" /> Matched keywords
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {report.matchedKeywords.length === 0 && (
                  <p className="text-sm text-muted-foreground">None detected.</p>
                )}
                {report.matchedKeywords.map((kw) => (
                  <Badge key={kw} variant="secondary">{kw}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <XCircle className="size-4 text-destructive" /> Missing keywords
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {report.missingKeywords.length === 0 && (
                  <p className="text-sm text-muted-foreground">None — great coverage!</p>
                )}
                {report.missingKeywords.map((kw) => (
                  <Badge key={kw} variant="outline">{kw}</Badge>
                ))}
              </div>
            </Card>
          </div>

          {report.recommendedBullets.length > 0 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold">Suggested bullet points</h2>
              <ul className="mt-3 space-y-2">
                {report.recommendedBullets.map((b, i) => (
                  <li key={i} className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                    {b}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-sm font-semibold">Gaps & fixes</h2>
            <div className="mt-3">
              <IssueList issues={report.gaps} />
            </div>
          </Card>

          {!report.aiEnabled && (
            <p className="text-xs text-muted-foreground">
              AI-powered gap analysis is disabled — configure an LLM provider in .env for deeper insight beyond keyword matching.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
