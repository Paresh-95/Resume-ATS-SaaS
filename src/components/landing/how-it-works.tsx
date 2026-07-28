import { UploadCloud, Sparkles, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload your resume",
    description: "Drop in a PDF, DOCX, or plain text file. We extract and parse it instantly.",
  },
  {
    icon: Sparkles,
    title: "Get scored & analyzed",
    description:
      "Run a general ATS check, or paste a job description for a targeted match score and keyword gap report.",
  },
  {
    icon: Rocket,
    title: "Fix it or regenerate it",
    description:
      "Follow specific, prioritized suggestions — or let AI rewrite your resume tailored to the exact role.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-4 text-lg text-muted-foreground">Three steps. No guesswork.</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-background text-primary shadow-sm ring-1 ring-border">
                <step.icon className="size-6" />
              </div>
              <div className="mt-5 text-sm font-medium text-primary">Step {i + 1}</div>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
