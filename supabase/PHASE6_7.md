# Phase 6 — Razorpay · Phase 7 — Admin

## Phase 6 endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/checkout` | Create order (server prices) + Razorpay order |
| POST | `/api/checkout/verify` | Verify `order_id|payment_id` HMAC; mark `paid` |
| POST | `/api/webhooks/razorpay` | Webhook: `payment.captured` / `payment.failed` / `order.paid` |

### Webhook setup (Razorpay Dashboard)

1. Webhooks → Add New Webhook  
2. URL: `https://YOUR_DOMAIN/api/webhooks/razorpay`  
3. Secret → copy into `RAZORPAY_WEBHOOK_SECRET`  
4. Events: `payment.captured`, `payment.failed`, `order.paid`

Signature: `HMAC_SHA256(raw_body, webhook_secret)` compared to `X-Razorpay-Signature`.

Client payment signature: `HMAC_SHA256(order_id|payment_id, key_secret)`.

## Phase 7 — Admin

Routes (client UI):

- `/admin` — overview stats  
- `/admin/orders` — list + set status  
- `/admin/products` — list / create / edit / soft-deactivate  

API (all gated by `profiles.role = 'admin'`):

- `GET|POST|PATCH|DELETE /api/admin/products`  
- `GET|PATCH /api/admin/orders`  

Promote admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

No extra SQL migration required beyond Phase 5 schema.
