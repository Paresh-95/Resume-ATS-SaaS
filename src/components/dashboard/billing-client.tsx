"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/billing/plans";

function BillingToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Subscription updated! It may take a few seconds to reflect below.");
    } else if (searchParams.get("canceled")) {
      toast.info("Checkout canceled.");
    }
  }, [searchParams]);

  return null;
}

export function BillingPlanGrid({ currentPlan }: { currentPlan: PlanId }) {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleChoosePlan(planId: PlanId) {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to start checkout");
        return;
      }

      window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to open billing portal");
        return;
      }

      window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <>
      <Suspense>
        <BillingToast />
      </Suspense>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
          {portalLoading && <Loader2 className="size-4 animate-spin" />}
          Manage billing
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = id === currentPlan;
          return (
            <Card key={id} className={`relative flex flex-col p-5 ${plan.highlight ? "border-primary" : ""}`}>
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
              )}
              <h3 className="font-semibold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  {plan.priceMonthly === null ? "Custom" : `$${plan.priceMonthly}`}
                </span>
                {plan.priceMonthly !== null && (
                  <span className="text-xs text-muted-foreground">/month</span>
                )}
              </div>

              <ul className="mt-4 flex-1 space-y-2 text-xs">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-4"
                variant={isCurrent ? "secondary" : plan.highlight ? "default" : "outline"}
                disabled={isCurrent || id === "FREE" || loadingPlan !== null}
                onClick={() => handleChoosePlan(id)}
              >
                {loadingPlan === id && <Loader2 className="size-4 animate-spin" />}
                {isCurrent ? "Current plan" : id === "FREE" ? "Default plan" : `Choose ${plan.name}`}
              </Button>
            </Card>
          );
        })}
      </div>
    </>
  );
}
