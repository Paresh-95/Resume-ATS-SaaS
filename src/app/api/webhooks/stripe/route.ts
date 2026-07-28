import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/billing/stripe";
import { planFromPriceId } from "@/lib/billing/plans";
import type { SubscriptionStatus } from "@prisma/client";

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: "ACTIVE",
  trialing: "TRIALING",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "INCOMPLETE",
  incomplete_expired: "CANCELED",
  unpaid: "UNPAID",
  paused: "CANCELED",
};

function getPeriodEnd(sub: Stripe.Subscription): Date | null {
  const rawEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    sub.items?.data?.[0]?.current_period_end;
  return typeof rawEnd === "number" ? new Date(rawEnd * 1000) : null;
}

async function upsertFromSubscription(sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price?.id;
  const plan = priceId ? planFromPriceId(priceId) : null;
  const userId = sub.metadata?.userId;

  const status = STATUS_MAP[sub.status] ?? "ACTIVE";
  const periodEnd = getPeriodEnd(sub);

  const data = {
    plan: plan ?? undefined,
    status,
    stripeSubscriptionId: sub.id,
    stripePriceId: priceId,
    currentPeriodEnd: periodEnd ?? undefined,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };

  if (userId) {
    await prisma.subscription.upsert({
      where: { userId },
      create: { userId, stripeCustomerId: sub.customer as string, ...data },
      update: data,
    });
  } else {
    await prisma.subscription.updateMany({
      where: { stripeCustomerId: sub.customer as string },
      data,
    });
  }
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Missing webhook signature/secret" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertFromSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: { plan: "FREE", status: "CANCELED", cancelAtPeriodEnd: false },
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Error handling Stripe webhook event:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
