import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
          Pricing
        </span>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free. Upgrade when you're applying at volume.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          return (
            <Card
              key={id}
              className={`relative flex flex-col p-6 ${
                plan.highlight ? "border-primary shadow-lg shadow-primary/10" : ""
              }`}
            >
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}

              <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-mono text-4xl font-semibold tracking-tight">
                  {plan.priceMonthly === null ? "Custom" : `$${plan.priceMonthly}`}
                </span>
                {plan.priceMonthly !== null && (
                  <span className="text-sm text-muted-foreground">/month</span>
                )}
              </div>

              <Link
                href={id === "FREE" ? "/register" : `/register?plan=${id}`}
                className={buttonVariants({
                  className: "mt-6",
                  variant: plan.highlight ? "default" : "outline",
                })}
              >
                {id === "FREE" ? "Get started free" : `Choose ${plan.name}`}
              </Link>

              <ul className="mt-6 space-y-3 border-t border-border/60 pt-6 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-pass" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
