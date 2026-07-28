import Link from "next/link";
import { ScanLine, Target, FileEdit, ArrowRight, FileText } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/billing/plans";
import { getUsageStatus } from "@/lib/billing/usage";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/check",
    icon: ScanLine,
    title: "General ATS Check",
    description: "Score your resume's formatting, structure, and impact.",
  },
  {
    href: "/dashboard/targeted",
    icon: Target,
    title: "Targeted JD Match",
    description: "Compare your resume against a specific job description.",
  },
  {
    href: "/dashboard/generate",
    icon: FileEdit,
    title: "AI Resume Generator",
    description: "Generate a tailored resume for a target role.",
  },
];

export default async function DashboardOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [subscription, resumes, recentReports, generalUsage, targetedUsage, generationUsage] =
    await Promise.all([
      prisma.subscription.findUnique({ where: { userId } }),
      prisma.resume.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.report.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, type: true, overallScore: true, jobTitle: true, createdAt: true },
      }),
      getUsageStatus(userId, "GENERAL_CHECK"),
      getUsageStatus(userId, "TARGETED_CHECK"),
      getUsageStatus(userId, "GENERATION"),
    ]);

  const plan = getPlan(subscription?.plan);

  const usageRows = [
    { label: "General checks", ...generalUsage },
    { label: "Targeted checks", ...targetedUsage },
    { label: "AI generations", ...generationUsage },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">Here's where things stand.</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1 text-sm">{plan.name} plan</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="h-full p-5 transition-colors hover:border-primary/40">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <action.icon className="size-4.5" />
              </div>
              <h3 className="mt-3 flex items-center gap-1 text-sm font-semibold">
                {action.title}
                <ArrowRight className="size-3.5" />
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Usage this month</h2>
          <Link href="/dashboard/billing" className="text-xs font-medium text-primary hover:underline">
            Manage plan
          </Link>
        </div>
        <div className="mt-4 space-y-4">
          {usageRows.map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">
                  {row.used} / {row.limit === Infinity ? "∞" : row.limit}
                </span>
              </div>
              <Progress
                value={row.limit === Infinity ? 5 : Math.min(100, (row.used / row.limit) * 100)}
                className="h-1.5"
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your resumes</h2>
          </div>
          {resumes.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No resumes uploaded yet.{" "}
              <Link href="/dashboard/check" className="font-medium text-primary hover:underline">
                Upload one
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {resumes.map((r) => (
                <li key={r.id} className="flex items-center gap-2.5 rounded-lg border border-border/60 p-3 text-sm">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{r.title}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent reports</h2>
            <Link href="/dashboard/history" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentReports.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No reports yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentReports.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm">
                  <span>
                    {r.type === "GENERAL" ? "General check" : `Targeted: ${r.jobTitle || "Untitled role"}`}
                  </span>
                  <Badge variant="secondary">{r.overallScore}/100</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {plan.id === "FREE" && (
        <Card className="flex flex-col items-center justify-between gap-4 border-primary/30 bg-primary/5 p-6 sm:flex-row">
          <div>
            <h3 className="text-sm font-semibold">Ready for more?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upgrade for more checks per month, AI resume generation, and full report history.
            </p>
          </div>
          <Link href="/dashboard/billing" className={buttonVariants({ className: "shrink-0" })}>
            View plans
          </Link>
        </Card>
      )}
    </div>
  );
}
