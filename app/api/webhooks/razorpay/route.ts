import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  getRazorpayKeys,
  verifyWebhookSignature,
  type RazorpayWebhookEvent,
} from "@/lib/razorpay";

/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay webhook endpoint. Verifies X-Razorpay-Signature against the raw body,
 * then updates order status. Primary source of truth for payment state.
 *
 * Configure in Razorpay Dashboard → Webhooks:
 *   URL: https://YOUR_DOMAIN/api/webhooks/razorpay
 *   Events: payment.captured, payment.failed, order.paid
 *   Secret: same value as RAZORPAY_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  const { webhookSecret } = getRazorpayKeys();
  if (!webhookSecret) {
    console.error("[webhook/razorpay] RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  if (!verifyWebhookSignature({ rawBody, signature, webhookSecret })) {
    console.warn("[webhook/razorpay] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = event.event ?? "";
  console.info("[webhook/razorpay]", eventName);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true, skipped: "no database" });
  }

  const service = createServiceClient();

  try {
    if (eventName === "payment.captured" || eventName === "order.paid") {
      const payment = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;
      const rpOrderId = payment?.order_id ?? orderEntity?.id;
      const rpPaymentId = payment?.id;
      const receipt = orderEntity?.receipt; // we set receipt = our order UUID

      if (!rpOrderId && !receipt) {
        return NextResponse.json({ ok: true, note: "no order reference" });
      }

      let q = service.from("orders").select("id, status");
      if (rpOrderId) {
        q = q.eq("razorpay_order_id", rpOrderId);
      } else if (receipt) {
        q = q.eq("id", receipt);
      }

      const { data: rows } = await q.limit(1);
      const order = rows?.[0];
      if (!order) {
        console.warn("[webhook/razorpay] order not found", { rpOrderId, receipt });
        return NextResponse.json({ ok: true, note: "order not found" });
      }

      if (order.status !== "paid" && order.status !== "fulfilled") {
        await service
          .from("orders")
          .update({
            status: "paid",
            razorpay_payment_id: rpPaymentId ?? null,
            razorpay_order_id: rpOrderId ?? undefined,
            paid_at: new Date().toISOString(),
          })
          .eq("id", order.id);
      }
    } else if (eventName === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      const rpOrderId = payment?.order_id;
      if (rpOrderId) {
        const { data: rows } = await service
          .from("orders")
          .select("id, status")
          .eq("razorpay_order_id", rpOrderId)
          .limit(1);
        const order = rows?.[0];
        if (order && order.status !== "paid" && order.status !== "fulfilled") {
          await service
            .from("orders")
            .update({ status: "failed" })
            .eq("id", order.id);
        }
      }
    }
  } catch (e) {
    console.error("[webhook/razorpay] handler error:", e);
    // Still 200 so Razorpay does not retry forever on our bugs; log for ops
  }

  return NextResponse.json({ ok: true });
}
