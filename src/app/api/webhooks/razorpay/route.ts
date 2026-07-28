import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { prisma } from "@/lib/prisma";
import { isRazorpayConfigured } from "@/lib/billing/razorpay";
import { planFromRazorpayPlanId } from "@/lib/billing/plans";
import type { Plan, SubscriptionStatus } from "@prisma/client";

interface RazorpaySubscriptionEntity {
  id: string;
  plan_id: string;
  status: string;
  customer_id: string | null;
  current_end?: number | null;
  notes?: Record<string, string | number>;
}

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  authenticated: "ACTIVE",
  active: "ACTIVE",
  resumed: "ACTIVE",
  pending: "PAST_DUE",
  halted: "UNPAID",
  cancelled: "CANCELED",
  completed: "CANCELED",
  expired: "CANCELED",
};

const TERMINAL_STATUSES = new Set(["cancelled", "completed", "expired"]);

async function upsertFromSubscription(sub: RazorpaySubscriptionEntity) {
  const userId = sub.notes?.userId ? String(sub.notes.userId) : undefined;
  const plan = planFromRazorpayPlanId(sub.plan_id);
  const status = STATUS_MAP[sub.status] ?? "ACTIVE";
  const periodEnd = typeof sub.current_end === "number" ? new Date(sub.current_end * 1000) : null;
  const terminal = TERMINAL_STATUSES.has(sub.status);

  const data: {
    status: SubscriptionStatus;
    razorpaySubscriptionId: string;
    razorpayPlanId: string;
    currentPeriodEnd?: Date;
    plan?: Plan;
    cancelAtPeriodEnd?: boolean;
  } = {
    status,
    razorpaySubscriptionId: sub.id,
    razorpayPlanId: sub.plan_id,
    currentPeriodEnd: periodEnd ?? undefined,
    ...(terminal
      ? { plan: "FREE" as const, cancelAtPeriodEnd: false }
      : plan
        ? { plan }
        : {}),
  };

  if (userId) {
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        razorpayCustomerId: sub.customer_id ?? undefined,
        ...data,
      },
      update: data,
    });
  } else {
    await prisma.subscription.updateMany({
      where: { razorpaySubscriptionId: sub.id },
      data,
    });
  }
}

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 501 });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Missing webhook signature/secret" }, { status: 400 });
  }

  const rawBody = await request.text();

  const valid = Razorpay.validateWebhookSignature(rawBody, signature, webhookSecret);
  if (!valid) {
    console.error("Razorpay webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload?: { subscription?: { entity: RazorpaySubscriptionEntity } };
  };

  try {
    switch (event.event) {
      case "subscription.authenticated":
      case "subscription.activated":
      case "subscription.charged":
      case "subscription.resumed":
      case "subscription.pending":
      case "subscription.halted":
      case "subscription.cancelled":
      case "subscription.completed": {
        const sub = event.payload?.subscription?.entity;
        if (sub) await upsertFromSubscription(sub);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Error handling Razorpay webhook event:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
