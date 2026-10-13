import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/orders";

/**
 * POST /api/orders
 * Body: { lines: { id, qty }[], guestEmail?, shipping?, notes? }
 *
 * Creates an order with server-side pricing (prices never taken from the client).
 * Authenticated users are attached via their session; guests may pass guestEmail.
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
    // Auth optional for guests
  }

  const email =
    typeof guestEmail === "string" && guestEmail.includes("@")
      ? guestEmail.trim().slice(0, 254)
      : null;

  if (!userId && !email) {
    // Still allow order without email for local testing; production should require one.
    // Soft requirement — clients should send guestEmail when not signed in.
  }

  const result = await createOrder({
    lines: lines as { id: string; qty: number }[],
    userId,
    guestEmail: email,
    shipping:
      shipping && typeof shipping === "object"
        ? (shipping as CreateOrderShipping)
        : null,
    notes: typeof notes === "string" ? notes.slice(0, 500) : null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    orderId: result.orderId,
    subtotalInr: result.subtotalInr,
    shippingInr: result.shippingInr,
    totalInr: result.totalInr,
    itemCount: result.itemCount,
    lines: result.lines.map((l) => ({
      productId: l.productId,
      sku: l.sku,
      name: l.name,
      unitPriceInr: l.unitPriceInr,
      quantity: l.quantity,
      lineTotalInr: l.lineTotalInr,
    })),
  });
}

type CreateOrderShipping = {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal?: string;
  country?: string;
};
