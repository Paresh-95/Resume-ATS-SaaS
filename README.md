# ATSPilot

AI-powered ATS resume checker SaaS built with Next.js 16, shadcn/ui, Prisma + PostgreSQL, Auth.js, LangChain (multi-vendor LLM), and Stripe.

## Features

1. **General ATS Check** — rule-based scoring engine (contact info, section structure, formatting, action verbs, quantified impact, keyword diversity, length) combined with optional AI-powered qualitative feedback.
2. **Targeted JD Match** — paste a job description and get a match score, matched/missing keyword report, and gap analysis.
3. **AI Resume Generator** — rewrites an existing resume tailored to a specific job description, truthfully (no fabricated experience).
4. Landing page + dashboard, email/password + Google auth, Basic/Pro/Enterprise subscription tiers via Stripe.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind v4
- **shadcn/ui** (Base UI primitives — note: this generation of shadcn uses `@base-ui/react`, not Radix. Components use a `render` prop instead of `asChild`.)
- **Prisma 6** + PostgreSQL
- **Auth.js (NextAuth v5)** — Credentials (email/password) + optional Google OAuth
- **LangChain.js** — vendor-agnostic model wrapper (`src/lib/ai/model.ts`), swap providers via env vars only
- **Stripe** — Checkout + subscriptions + webhooks

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. Any managed Postgres works (Neon, Supabase, RDS, local). |
| `AUTH_SECRET` | Yes | Generate with `npx auth secret` or `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` in dev. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Leave blank to disable Google sign-in (credentials login still works). |
| `MODEL_PROVIDER` | Yes (for AI features) | `"openai"`, `"anthropic"`, or `"groq"`. |
| `MODEL_NAME` | No | Defaults to a sensible model per provider. |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GROQ_API_KEY` | One required for AI features | Only the key matching `MODEL_PROVIDER` is used. Without it, general/targeted checks fall back to rule-based/keyword-only scoring, and the AI resume generator is disabled. |
| `STRIPE_SECRET_KEY` | Yes (for billing) | From the Stripe dashboard. |
| `STRIPE_WEBHOOK_SECRET` | Yes (for billing) | From `stripe listen` (dev) or your webhook endpoint config (prod). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No (not currently used client-side, reserved) | |
| `STRIPE_PRICE_BASIC` / `STRIPE_PRICE_PRO` / `STRIPE_PRICE_ENTERPRISE` | Yes (for billing) | Stripe Price IDs for each recurring plan. |
| `NEXT_PUBLIC_APP_URL` | Yes | Used for Stripe redirect/return URLs. |

### 3. Set up the database

```bash
npx prisma migrate dev --name init
```

This creates the `users`, `accounts`, `sessions`, `resumes`, `reports`, `resume_generations`, `subscriptions`, and `usage` tables.

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 5. (Optional) Test Stripe webhooks locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Subscription plans

Defined in [`src/lib/billing/plans.ts`](src/lib/billing/plans.ts):

- **Free** — 3 general checks / 1 targeted check / 0 generations per month
- **Basic** ($9/mo) — 20 general / 10 targeted / 5 generations
- **Pro** ($29/mo) — unlimited general / 50 targeted / 30 generations
- **Enterprise** ($99/mo) — unlimited everything

Usage is tracked per user per calendar month in the `usage` table ([`src/lib/billing/usage.ts`](src/lib/billing/usage.ts)) and enforced server-side before each check/generation runs.

## Project structure

```
src/
  auth.ts                 # Auth.js config
  proxy.ts                # Route protection (Next 16 renamed middleware.ts -> proxy.ts)
  lib/
    ai/                    # LangChain model abstraction, schemas, chains
    ats/                   # Rule-based scoring engine + keyword extraction
    resume/                # PDF/DOCX/text parsing
    billing/                # Plans, Stripe client, usage limits
  app/
    page.tsx                # Landing page
    login/, register/       # Auth pages
    dashboard/               # Authenticated app (overview, check, targeted, generate, history, billing)
    api/                     # Route handlers
```

## Notes on this Next.js/shadcn version

This project was scaffolded with bleeding-edge versions where some conventions differ from older tutorials/training data:

- **Next.js 16**: `middleware.ts` is renamed `proxy.ts`; `params`/`searchParams` in pages and route handlers are `Promise`s and must be awaited.
- **shadcn/ui**: generated components use `@base-ui/react` instead of Radix. Use the `render` prop (e.g. `<SheetTrigger render={<Button />}>`) instead of `asChild`. For a plain link styled as a button, apply `buttonVariants({...})` directly to the `<Link>` rather than wrapping a `<Button asChild>`.
- **Prisma**: pinned to v6 (not v7) — v7 moved the datasource URL out of `schema.prisma` and requires driver adapters, which added risk/unfamiliarity for this project. If you want v7, migrate deliberately later.
