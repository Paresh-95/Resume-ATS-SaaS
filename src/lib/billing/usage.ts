import { prisma } from "@/lib/prisma";
import { getPlan } from "./plans";
import type { UsageAction } from "@prisma/client";

function getPeriodKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const ACTION_TO_LIMIT_KEY: Record<
  UsageAction,
  "generalChecks" | "targetedChecks" | "generations"
> = {
  GENERAL_CHECK: "generalChecks",
  TARGETED_CHECK: "targetedChecks",
  GENERATION: "generations",
};

export interface UsageCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  plan: string;
}

export async function getUsageStatus(
  userId: string,
  action: UsageAction,
): Promise<UsageCheckResult> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const plan = getPlan(subscription?.plan);
  const limit = plan.limits[ACTION_TO_LIMIT_KEY[action]];

  const periodKey = getPeriodKey();
  const usage = await prisma.usage.findUnique({
    where: { userId_action_periodKey: { userId, action, periodKey } },
  });
  const used = usage?.count ?? 0;

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: limit === Infinity ? Infinity : Math.max(0, limit - used),
    plan: plan.name,
  };
}

/**
 * Atomically checks whether the user has quota remaining for this action and,
 * if so, increments their usage counter for the current month. Returns the
 * resulting status either way so callers can render a clear upgrade prompt.
 */
export async function consumeUsage(
  userId: string,
  action: UsageAction,
): Promise<UsageCheckResult> {
  const status = await getUsageStatus(userId, action);
  if (!status.allowed) return status;

  const periodKey = getPeriodKey();
  await prisma.usage.upsert({
    where: { userId_action_periodKey: { userId, action, periodKey } },
    create: { userId, action, periodKey, count: 1 },
    update: { count: { increment: 1 } },
  });

  return {
    ...status,
    used: status.used + 1,
    remaining:
      status.limit === Infinity ? Infinity : Math.max(0, status.limit - status.used - 1),
  };
}
