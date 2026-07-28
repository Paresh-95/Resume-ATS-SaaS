import { AlertTriangle, AlertCircle, Info, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface DisplayIssue {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  section?: string;
  source?: "rule" | "ai";
}

const SEVERITY_CONFIG = {
  high: { icon: AlertCircle, label: "High priority", className: "text-destructive" },
  medium: { icon: AlertTriangle, label: "Medium", className: "text-amber-500" },
  low: { icon: Info, label: "Low", className: "text-muted-foreground" },
};

export function IssueList({ issues }: { issues: DisplayIssue[] }) {
  if (issues.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        No issues found. Nice work.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {issues.map((issue, i) => {
        const config = SEVERITY_CONFIG[issue.severity];
        const Icon = config.icon;
        return (
          <li
            key={i}
            className="flex gap-3 rounded-lg border border-border/60 p-4"
          >
            <Icon className={cn("mt-0.5 size-4.5 shrink-0", config.className)} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{issue.title}</p>
                {issue.section && (
                  <Badge variant="secondary" className="text-[10px]">
                    {issue.section}
                  </Badge>
                )}
                {issue.source === "ai" && (
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <Sparkles className="size-3" /> AI
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{issue.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
