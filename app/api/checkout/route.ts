import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/orders";

/**
 * POST /api/checkout
 * Body: { lines: { id, qty }[], guestEmail?, shipping?, notes? }
 *
 * 1. Creates order with server-authoritative prices
 * 2. Creates a Razorpay order (when keys present)
 * 3. Returns { orderId, razorpayOrderId, amount, currency, keyId }
 *
 * Client opens Razorpay Checkout with the returned values.
 * Payment verification + webhook land in a later phase.
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

  const { lines, guestEmail, shipping, notes } = body as {
    lines?: unknown;
    guestEmail?: unknown;
    shipping?: unknown;
    notes?: unknown;
  };

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    /* guests ok */
  }

  const email =
    typeof guestEmail === "string" && guestEmail.includes("@")
      ? guestEmail.trim().slice(0, 254)
      : null;

  const result = await createOrder({
    lines: lines as { id: string; qty: number }[],
    userId,
    guestEmail: email,
    shipping:
      shipping && typeof shipping === "object"
        ? (shipping as {
            name?: string;
            phone?: string;
            line1?: string;
            line2?: string;
            city?: string;
            state?: string;
            postal?: string;
            country?: string;
          })
        : null,
    notes: typeof notes === "string" ? notes.slice(0, 500) : null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Without Razorpay keys: return priced order only (local / Phase 5 smoke test)
  if (!keyId || !keySecret) {
    return NextResponse.json({
      orderId: result.orderId,
      amount: result.totalInr * 100, // paise
      currency: "INR",
      keyId: null,
      razorpayOrderId: null,
      message: "Razorpay keys not configured — order created with server prices only",
      lines: result.lines,
      totalInr: result.totalInr,
    });
  }

  // Create Razorpay order (amount in paise)
  const amountPaise = result.totalInr * 100;
  const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: result.orderId,
      notes: { aurelia_order_id: result.orderId },
    }),
  });

  if (!rpRes.ok) {
    const errText = await rpRes.text().catch(() => "");
    console.error("[checkout] Razorpay order failed:", rpRes.status, errText);
    return NextResponse.json({ error: "Payment provider error" }, { status: 502 });
  }

  const rpOrder = (await rpRes.json()) as { id: string; amount: number; currency: string };

  // Persist razorpay_order_id and move status → payment_pending
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const service = createServiceClient();
      await service
        .from("orders")
        .update({
          razorpay_order_id: rpOrder.id,
          status: "payment_pending",
        })
        .eq("id", result.orderId);
    } catch (e) {
      console.error("[checkout] failed to update order with razorpay id:", e);
    }
  }

  return NextResponse.json({
    orderId: result.orderId,
    razorpayOrderId: rpOrder.id,
    amount: rpOrder.amount,
    currency: rpOrder.currency,
    keyId,
    totalInr: result.totalInr,
    lines: result.lines,
  });
}
