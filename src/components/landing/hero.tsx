import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_50%_0%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent)]"
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
        <div>
          <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
            <Sparkles className="size-3.5" />
            AI-powered ATS scoring
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Beat the ATS.
            <br />
            <span className="text-primary">Land more interviews.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
            ATSPilot scores your resume the way applicant tracking systems and
            recruiters actually read it — then tailors it to any job
            description and rewrites it for you, in seconds.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className={buttonVariants({ size: "lg", className: "gap-2" })}>
              Check my resume free <ArrowRight className="size-4" />
            </Link>
            <Link href="#how-it-works" className={buttonVariants({ size: "lg", variant: "outline" })}>
              See how it works
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" /> Results in under 30 seconds
            </span>
          </div>
        </div>

        <div className="relative">
          <Card className="mx-auto max-w-sm border-border/60 p-6 shadow-2xl shadow-primary/10 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ATS Score</p>
                <p className="text-4xl font-bold tracking-tight">87<span className="text-lg text-muted-foreground">/100</span></p>
              </div>
              <div className="flex size-16 items-center justify-center rounded-full border-4 border-primary text-sm font-semibold text-primary">
                Good
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                { label: "Keyword match", value: 92 },
                { label: "Formatting", value: 88 },
                { label: "Impact & metrics", value: 74 },
                { label: "Action verbs", value: 95 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">{row.value}%</span>
                  </div>
                  <Progress value={row.value} className="h-1.5" />
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Suggestion:</span> Add
              measurable results to 3 more bullet points to boost your impact score.
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
