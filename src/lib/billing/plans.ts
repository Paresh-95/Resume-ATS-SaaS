import type { Plan } from "@prisma/client";

export type PlanId = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  priceMonthly: number | null; // null = "contact us"
  priceEnvVar: string | null; // Stripe price ID env var name
  highlight?: boolean;
  limits: {
    generalChecks: number; // per month, Infinity = unlimited
    targetedChecks: number;
    generations: number;
  };
  features: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  FREE: {
    id: "FREE",
    name: "Free",
    description: "Try the core ATS check before you commit.",
    priceMonthly: 0,
    priceEnvVar: null,
    limits: { generalChecks: 3, targetedChecks: 1, generations: 0 },
    features: [
      "3 general ATS checks / month",
      "1 targeted (JD-matched) check / month",
      "Core formatting & keyword analysis",
    ],
  },
  BASIC: {
    id: "BASIC",
    name: "Basic",
    description: "For active job seekers applying to a handful of roles.",
    priceMonthly: 9,
    priceEnvVar: "STRIPE_PRICE_BASIC",
    limits: { generalChecks: 20, targetedChecks: 10, generations: 5 },
    features: [
      "20 general ATS checks / month",
      "10 targeted JD-match checks / month",
      "5 AI-tailored resume generations / month",
      "Full AI-powered feedback",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    description: "For serious job seekers applying at volume.",
    priceMonthly: 29,
    priceEnvVar: "STRIPE_PRICE_PRO",
    highlight: true,
    limits: {
      generalChecks: Infinity,
      targetedChecks: 50,
      generations: 30,
    },
    features: [
      "Unlimited general ATS checks",
      "50 targeted JD-match checks / month",
      "30 AI-tailored resume generations / month",
      "Priority AI model access",
      "Full report history",
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    description: "For career coaches, bootcamps, and teams.",
    priceMonthly: 99,
    priceEnvVar: "STRIPE_PRICE_ENTERPRISE",
    limits: {
      generalChecks: Infinity,
      targetedChecks: Infinity,
      generations: Infinity,
    },
    features: [
      "Unlimited everything",
      "Multiple team members",
      "Priority support",
      "Custom onboarding",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["FREE", "BASIC", "PRO", "ENTERPRISE"];

export function getPlan(plan: Plan | PlanId | undefined | null): PlanDefinition {
  if (!plan || !(plan in PLANS)) return PLANS.FREE;
  return PLANS[plan as PlanId];
}

export function getPriceId(plan: PlanId): string | null {
  const def = PLANS[plan];
  if (!def.priceEnvVar) return null;
  return process.env[def.priceEnvVar] || null;
}

export function planFromPriceId(priceId: string): PlanId | null {
  for (const id of PLAN_ORDER) {
    if (getPriceId(id) === priceId) return id;
  }
  return null;
}
