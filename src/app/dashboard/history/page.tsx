import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History } from "lucide-react";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function HistoryPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [reports, generations] = await Promise.all([
    prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { resume: { select: { title: true } } },
    }),
    prisma.resumeGeneration.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { sourceResume: { select: { title: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <History className="size-6 text-primary" />
          History
        </h1>
        <p className="mt-1 text-muted-foreground">All your past checks and generated resumes.</p>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="generations">Generated resumes ({generations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4">
          <Card className="overflow-hidden p-0">
            {reports.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No reports yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resume</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.resume.title}</TableCell>
                      <TableCell>
                        <Badge variant={r.type === "GENERAL" ? "secondary" : "outline"}>
                          {r.type === "GENERAL" ? "General" : "Targeted"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.jobTitle || "—"}</TableCell>
                      <TableCell>{r.overallScore}/100</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="generations" className="mt-4">
          <Card className="overflow-hidden p-0">
            {generations.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No generated resumes yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Based on</TableHead>
                    <TableHead>Target role</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generations.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">
                        {g.sourceResume?.title || "Deleted resume"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{g.jobTitle || "—"}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(g.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
