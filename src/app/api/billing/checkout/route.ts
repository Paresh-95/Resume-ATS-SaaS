import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpay, isRazorpayConfigured } from "@/lib/billing/razorpay";
import { getRazorpayPlanId } from "@/lib/billing/plans";

const bodySchema = z.object({ plan: z.enum(["BASIC", "PRO", "ENTERPRISE"]) });

// Razorpay has no hosted Checkout page like Stripe — the client opens the
// Razorpay Checkout modal itself using the subscription ID we create here.
const BILLING_CYCLES_PER_SUBSCRIPTION = 12;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Razorpay is not configured yet. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to .env." },
      { status: 501 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const razorpayPlanId = getRazorpayPlanId(parsed.data.plan);
  if (!razorpayPlanId) {
    return NextResponse.json(
      { error: `No Razorpay plan configured for ${parsed.data.plan}. Set its plan env var in .env.` },
      { status: 501 },
    );
  }

  const razorpay = getRazorpay();

  const rzpSubscription = await razorpay.subscriptions.create({
    plan_id: razorpayPlanId,
    customer_notify: 1,
    total_count: BILLING_CYCLES_PER_SUBSCRIPTION,
    notes: { userId: session.user.id, plan: parsed.data.plan },
  });

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      razorpaySubscriptionId: rzpSubscription.id,
      razorpayPlanId,
      status: "INCOMPLETE",
    },
    update: {
      razorpaySubscriptionId: rzpSubscription.id,
      razorpayPlanId,
      status: "INCOMPLETE",
    },
  });

  return NextResponse.json({
    subscriptionId: rzpSubscription.id,
    keyId: process.env.RAZORPAY_KEY_ID,
    plan: parsed.data.plan,
    prefill: { name: session.user.name || undefined, email: session.user.email },
  });
}
