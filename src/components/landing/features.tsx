import { Card } from "@/components/ui/card";
import { Mascot, type MascotPose } from "@/components/mascot";

const FEATURES: {
  pose: MascotPose;
  title: string;
  description: string;
  points: string[];
}[] = [
  {
    pose: "review-magnify",
    title: "General ATS Check",
    description:
      "Instantly scan any resume for the formatting, structure, and content issues that get real resumes silently rejected by ATS software — before a human ever sees them.",
    points: [
      "Section & contact info detection",
      "Action verb & impact analysis",
      "Formatting red-flag detection",
    ],
  },
  {
    pose: "stars-laptop",
    title: "Targeted JD Match",
    description:
      "Paste any job description and get a precise match score, missing keyword report, and gap analysis — so you know exactly what to fix before you apply.",
    points: [
      "Keyword gap analysis",
      "Role-fit match score",
      "Suggested bullet points to add",
    ],
  },
  {
    pose: "idea-lightbulb",
    title: "AI Resume Generator",
    description:
      "Turn your existing resume into a version tailored specifically for the role you want — rewritten to highlight the right experience, truthfully.",
    points: [
      "Tailored to a specific JD",
      "Keeps your real experience intact",
      "Ready-to-export plain text",
    ],
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
          Capabilities
        </span>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to get past the filter
        </h2>
        <p className="mt-4 text-lg text-muted-foreground text-pretty">
          Three focused tools that cover the entire job application workflow —
          from a quick sanity check to a fully tailored resume.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Card key={feature.title} className="p-6">
            <div className="flex items-center justify-between">
              <Mascot pose={feature.pose} height={72} />
              <span className="font-mono text-xs text-muted-foreground">
                0{i + 1}
              </span>
            </div>
            <h3 className="mt-5 font-heading text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              {feature.description}
            </p>
            <ul className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
              {feature.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-muted-foreground">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
