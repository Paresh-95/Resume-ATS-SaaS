import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

// NOTE: Placeholder quotes for launch design purposes only — swap these for
// real customer testimonials (with permission) before going live.
const TESTIMONIALS = [
  {
    initials: "JR",
    role: "Software Engineer",
    quote:
      "The keyword gap report showed me exactly which skills to add for a role I almost didn't apply to. Got an interview a week later.",
  },
  {
    initials: "AM",
    role: "Marketing Manager",
    quote:
      "I didn't realize my bullet points had zero measurable results until the general check flagged it. Simple fix, much stronger resume.",
  },
  {
    initials: "KP",
    role: "Data Analyst",
    quote:
      "Used the tailored resume generator for three different applications. Each one felt specific instead of generic.",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Job seekers are getting more callbacks
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.initials} className="p-6">
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-pretty">“{t.quote}”</p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{t.initials}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
