# Aurelia Supabase — Phase 5

## What this phase adds

1. **Schema** — `profiles`, `products`, `orders`, `order_items`
2. **Auth** — Supabase Auth (email/password + magic link) with auto profile creation
3. **RLS** — public read of active products; users read own profile/orders; writes to orders only via service role
4. **Secure server-side pricing** — `POST /api/orders` and `POST /api/checkout` re-read prices from `products` (or static catalog fallback). Client prices are never trusted.

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run in order:
   - `migrations/20261013_phase5_schema.sql`
   - `migrations/20261013_phase5_seed_products.sql`
3. Enable **Email** auth under Authentication → Providers.
4. Copy Project URL + anon key + service_role key into `.env.local` (see `.env.example`).
5. Optional: add Razorpay test keys for live Checkout modal.

```bash
cp .env.example .env.local
# fill values
npm install
npm run dev
```

## Security model

| Action | Who | How |
|--------|-----|-----|
| Read active products | anyone | RLS `active = true` |
| Sign up / sign in | anyone | Supabase Auth |
| Update own profile | authenticated user | RLS; **cannot** change `role` |
| Create order | Next.js API (service role) | Prices from DB |
| Read own orders | authenticated owner | RLS |
| Admin product/order writes | `profiles.role = 'admin'` or service role | RLS + service key |

Promote an admin (run as service role / SQL editor):

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## API

### `POST /api/orders`

```json
{ "lines": [{ "id": "necklace-mesh", "qty": 1 }], "guestEmail": "a@b.com" }
```

Returns server-priced lines + `orderId`.

### `POST /api/checkout`

Same body. Creates order, then (if Razorpay keys present) a Razorpay order and returns `razorpayOrderId` + `keyId` for the Checkout modal.

## Cart behaviour

- Client stores only `{ id, qty }` in `localStorage`.
- Display prices come from the static catalog (`lib/products.ts`).
- At checkout the server **re-resolves** every line against `public.products.price_inr`.
- If Supabase is offline, the static catalog is used so local dev still works.
