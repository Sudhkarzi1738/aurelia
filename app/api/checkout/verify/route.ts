import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getRazorpayKeys, verifyPaymentSignature } from "@/lib/razorpay";

/**
 * POST /api/checkout/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId? }
 *
 * Verifies the client-returned payment signature, then marks the order paid.
 * Prefer the webhook as the primary source of truth; this is the fast path for UX.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    razorpay_order_id: rpOrderId,
    razorpay_payment_id: rpPaymentId,
    razorpay_signature: rpSignature,
    orderId: clientOrderId,
  } = body as Record<string, unknown>;

  if (
    typeof rpOrderId !== "string" ||
    typeof rpPaymentId !== "string" ||
    typeof rpSignature !== "string"
  ) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  const { keySecret, configured } = getRazorpayKeys();
  if (!configured || !keySecret) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const valid = verifyPaymentSignature({
    orderId: rpOrderId,
    paymentId: rpPaymentId,
    signature: rpSignature,
    keySecret,
  });

  if (!valid) {
    console.warn("[checkout/verify] invalid signature", { rpOrderId, rpPaymentId });
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      ok: true,
      verified: true,
      message: "Signature valid (no DB configured)",
    });
  }

  const service = createServiceClient();

  // Locate order by razorpay_order_id (preferred) or client orderId
  let query = service.from("orders").select("id, status, total_inr, razorpay_order_id");
  if (typeof clientOrderId === "string" && clientOrderId) {
    query = query.or(`razorpay_order_id.eq.${rpOrderId},id.eq.${clientOrderId}`);
  } else {
    query = query.eq("razorpay_order_id", rpOrderId);
  }

  const { data: orders, error: findErr } = await query.limit(1);
  if (findErr) {
    console.error("[checkout/verify] lookup failed:", findErr.message);
    return NextResponse.json({ error: "Order lookup failed" }, { status: 500 });
  }

  const order = orders?.[0];
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "paid" || order.status === "fulfilled") {
    return NextResponse.json({
      ok: true,
      orderId: order.id,
      status: order.status,
      alreadyPaid: true,
    });
  }

  const { error: updErr } = await service
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: rpPaymentId,
      razorpay_signature: rpSignature,
      razorpay_order_id: rpOrderId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updErr) {
    console.error("[checkout/verify] update failed:", updErr.message);
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    status: "paid",
    totalInr: order.total_inr,
  });
}
