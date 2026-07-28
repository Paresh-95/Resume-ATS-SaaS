"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/billing/plans";
import type { SubscriptionStatus } from "@prisma/client";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

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

export function BillingPlanGrid({
  currentPlan,
  subscriptionStatus,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: {
  currentPlan: PlanId;
  subscriptionStatus?: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

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

      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "ATSPilot",
        description: `${PLANS[planId].name} plan`,
        prefill: data.prefill,
        theme: { color: "#3730e5" },
        handler: () => {
          toast.success("Subscription started! It may take a few seconds to reflect below.");
          router.refresh();
        },
        modal: {
          ondismiss: () => {
            toast.info("Checkout canceled.");
          },
        },
      });
      rzp.open();
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleCancelSubscription() {
    setCancelLoading(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to cancel subscription");
        return;
      }

      toast.success("Subscription will end at the close of your current billing period.");
      router.refresh();
    } finally {
      setCancelLoading(false);
    }
  }

  const hasPaidSubscription = currentPlan !== "FREE" && subscriptionStatus !== "CANCELED";

  return (
    <>
      <Suspense>
        <BillingToast />
      </Suspense>

      {hasPaidSubscription && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {cancelAtPeriodEnd && currentPeriodEnd && (
            <p className="font-mono text-xs text-muted-foreground">
              Ends {new Date(currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          <Button
            variant="outline"
            onClick={handleCancelSubscription}
            disabled={cancelLoading || cancelAtPeriodEnd}
          >
            {cancelLoading && <Loader2 className="size-4 animate-spin" />}
            {cancelAtPeriodEnd ? "Cancellation scheduled" : "Cancel subscription"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = id === currentPlan;
          return (
            <Card key={id} className={`relative flex flex-col p-5 ${plan.highlight ? "border-primary" : ""}`}>
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
              )}
              <h3 className="font-heading font-semibold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-mono text-2xl font-semibold">
                  {plan.priceMonthly === null ? "Custom" : `$${plan.priceMonthly}`}
                </span>
                {plan.priceMonthly !== null && (
                  <span className="text-xs text-muted-foreground">/month</span>
                )}
              </div>

              <ul className="mt-4 flex-1 space-y-2 text-xs">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-pass" />
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
