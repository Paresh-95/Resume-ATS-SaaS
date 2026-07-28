import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/billing/stripe";
import { getPriceId } from "@/lib/billing/plans";

const bodySchema = z.object({ plan: z.enum(["BASIC", "PRO", "ENTERPRISE"]) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env." },
      { status: 501 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = getPriceId(parsed.data.plan);
  if (!priceId) {
    return NextResponse.json(
      { error: `No Stripe price configured for ${parsed.data.plan}. Set its price env var in .env.` },
      { status: 501 },
    );
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  let subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  let stripeCustomerId = subscription?.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name || undefined,
      metadata: { userId: session.user.id },
    });
    stripeCustomerId = customer.id;

    subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, stripeCustomerId },
      update: { stripeCustomerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
    metadata: { userId: session.user.id, plan: parsed.data.plan },
    subscription_data: {
      metadata: { userId: session.user.id, plan: parsed.data.plan },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
