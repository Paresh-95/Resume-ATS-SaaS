import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
          Ready to stop getting filtered out?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Your first resume check is free — no credit card required.
        </p>
        <Link href="/register" className={buttonVariants({ size: "lg", className: "mt-8 gap-2" })}>
          Check my resume now <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
