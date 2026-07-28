import { UploadCloud, Sparkles, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    tag: "STEP_01",
    title: "Upload your resume",
    description: "Drop in a PDF, DOCX, or plain text file. We extract and parse it instantly.",
  },
  {
    icon: Sparkles,
    tag: "STEP_02",
    title: "Get scored & analyzed",
    description:
      "Run a general ATS check, or paste a job description for a targeted match score and keyword gap report.",
  },
  {
    icon: Rocket,
    tag: "STEP_03",
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
          <span className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
            Process
          </span>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Three steps. No guesswork.</p>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div
            aria-hidden
            className="absolute top-7 right-[16.6%] left-[16.6%] hidden h-px bg-border md:block"
          />
          {STEPS.map((step) => (
            <div key={step.title} className="relative text-center">
              <div className="relative mx-auto flex size-14 items-center justify-center rounded-full bg-background text-primary shadow-sm ring-1 ring-border">
                <step.icon className="size-6" />
              </div>
              <div className="mt-5 font-mono text-xs font-medium tracking-widest text-primary">
                {step.tag}
              </div>
              <h3 className="mt-1 font-heading text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
