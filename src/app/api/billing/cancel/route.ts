import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpay, isRazorpayConfigured } from "@/lib/billing/razorpay";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Razorpay is not configured yet. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to .env." },
      { status: 501 },
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.razorpaySubscriptionId) {
    return NextResponse.json(
      { error: "No active subscription found." },
      { status: 400 },
    );
  }

  const razorpay = getRazorpay();
  // cancel_at_cycle_end keeps access through the paid period instead of
  // revoking it immediately.
  await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId, true);

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: { cancelAtPeriodEnd: true },
  });

  return NextResponse.json({ ok: true });
}
