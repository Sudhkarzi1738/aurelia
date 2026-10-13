# Aurelia — Vercel deployment

## Prerequisites

1. Supabase project with Phase 5 SQL applied:
   - `supabase/migrations/20261013_phase5_schema.sql`
   - `supabase/migrations/20261013_phase5_seed_products.sql`
2. Razorpay account (test mode is fine to start)
3. GitHub/GitLab repo or Vercel CLI access

## Deploy to Vercel

### Option A — Dashboard

1. [vercel.com/new](https://vercel.com/new) → import the `aurelia-next` folder (or monorepo root with Root Directory = `aurelia-next`).
2. Framework Preset: **Next.js**
3. Build Command: `next build` (default)
4. Install Command: `npm install`
5. Node.js: 20.x recommended

### Option B — CLI

```bash
cd aurelia-next
npm install
npx vercel
# production:
npx vercel --prod
```

## Environment variables

Set in **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Name | Notes |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — never prefix with `NEXT_PUBLIC_` |
| `RAZORPAY_KEY_ID` | `rzp_test_…` or live |
| `RAZORPAY_KEY_SECRET` | Server only |
| `RAZORPAY_WEBHOOK_SECRET` | From Razorpay webhook config |

Redeploy after adding secrets.

## Supabase Auth URLs

**Authentication → URL Configuration:**

- Site URL: `https://YOUR_DOMAIN`
- Redirect URLs: `https://YOUR_DOMAIN/auth/callback`  
  (also add `http://localhost:3000/auth/callback` for local)

## Razorpay webhook

1. Razorpay Dashboard → Webhooks → Add  
2. URL: `https://YOUR_DOMAIN/api/webhooks/razorpay`  
3. Events: `payment.captured`, `payment.failed`, `order.paid`  
4. Copy signing secret → `RAZORPAY_WEBHOOK_SECRET`

## Post-deploy checklist

- [ ] Home loads; product images from `/assets/…`
- [ ] `/product/necklace-mesh` opens PDP
- [ ] Add to bag → cart drawer → **Full checkout** → `/checkout`
- [ ] Sign in / magic link (email provider enabled)
- [ ] Promote admin:  
  `update public.profiles set role = 'admin' where email = 'you@…';`
- [ ] `/admin` shows overview (while signed in as admin)
- [ ] Test payment in Razorpay test mode; order status → `paid`
- [ ] Webhook delivery logs show 200 in Razorpay dashboard

## Local verification

```bash
cp .env.example .env.local   # fill keys
npm install
npm run test                 # offline smoke tests
npm run dev
```

## Routes map

| Path | Purpose |
|------|---------|
| `/` | Storefront |
| `/product/[id]` | Product detail |
| `/checkout` | Full checkout + shipping |
| `/our-story`, `/artisans`, `/ateliers`, `/journal` | Maison pages |
| `/contact`, `/book-viewing`, `/ring-sizing`, `/care` | Concierge |
| `/admin`, `/admin/orders`, `/admin/products` | Admin (role-gated) |
| `/api/checkout`, `/api/checkout/verify` | Orders + payment verify |
| `/api/webhooks/razorpay` | Payment webhooks |
| `/auth/callback` | Auth redirect |

## Notes

- Cart stores only `{ id, qty }`; prices are always re-read on the server.
- Without Razorpay keys, checkout still creates a server-priced order (dev-friendly).
- Service role key must be available on the server for order writes and admin APIs.
