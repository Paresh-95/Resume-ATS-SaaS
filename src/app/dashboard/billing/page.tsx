import { CreditCard } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/billing/plans";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingPlanGrid } from "@/components/dashboard/billing-client";

export default async function BillingPage() {
  const session = await auth();
  const userId = session!.user.id;

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const plan = getPlan(subscription?.plan);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <CreditCard className="size-6 text-primary" />
          Billing
        </h1>
        <p className="mt-1 text-muted-foreground">Manage your subscription plan.</p>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">Current plan</p>
          <p className="mt-1 text-lg font-semibold">{plan.name}</p>
        </div>
        <Badge variant={subscription?.status === "ACTIVE" ? "secondary" : "outline"}>
          {subscription?.status || "ACTIVE"}
        </Badge>
      </Card>

      <BillingPlanGrid currentPlan={plan.id} />
    </div>
  );
}
