/**
 * Server-side order creation with secure pricing.
 * Client sends only product ids + quantities. Prices are always re-read from
 * the database (or the static catalog fallback). Never trust client prices.
 */

import { createServiceClient } from "@/lib/supabase/server";
import { productById } from "@/lib/catalog";
import type { Product } from "@/lib/products";

export const MAX_QTY = 10;
export const MAX_LINES = 30;

export type CartInputLine = { id: string; qty: number };

export type PricedLine = {
  productId: string;
  sku: string;
  name: string;
  unitPriceInr: number;
  quantity: number;
  lineTotalInr: number;
};

export type CreateOrderInput = {
  lines: CartInputLine[];
  userId?: string | null;
  guestEmail?: string | null;
  shipping?: {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal?: string;
    country?: string;
  } | null;
  notes?: string | null;
};

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      subtotalInr: number;
      shippingInr: number;
      totalInr: number;
      itemCount: number;
      lines: PricedLine[];
    }
  | { ok: false; error: string; status: number };

/** Sanitize raw cart payload from the client. */
export function sanitizeCartInput(raw: unknown): CartInputLine[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_LINES) return null;
  const merged = new Map<string, number>();
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const id = typeof (item as { id?: unknown }).id === "string" ? (item as { id: string }).id.trim() : "";
    const qtyRaw = (item as { qty?: unknown }).qty;
    const qty = typeof qtyRaw === "number" && Number.isFinite(qtyRaw) ? Math.floor(qtyRaw) : NaN;
    if (!id || !Number.isFinite(qty) || qty < 1) return null;
    merged.set(id, Math.min(MAX_QTY, (merged.get(id) ?? 0) + qty));
  }
  if (merged.size === 0) return null;
  return [...merged].map(([id, qty]) => ({ id, qty }));
}

/**
 * Resolve unit prices from Supabase products table (preferred).
 * Falls back to the static in-memory catalog if DB is unavailable
 * (e.g. local dev without env vars).
 */
async function resolvePrices(
  lines: CartInputLine[]
): Promise<{ priced: PricedLine[]; error?: string }> {
  const ids = lines.map((l) => l.id);

  let dbProducts: Map<string, { price_inr: number; sku: string; name: string; active: boolean }> | null = null;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, sku, name, price_inr, active")
        .in("id", ids);

      if (error) {
        console.error("[orders] products query error:", error.message);
      } else if (data) {
        dbProducts = new Map(
          data.map((p) => [
            p.id as string,
            {
              price_inr: p.price_inr as number,
              sku: p.sku as string,
              name: p.name as string,
              active: p.active as boolean,
            },
          ])
        );
      }
    }
  } catch (e) {
    console.warn("[orders] Supabase unavailable, falling back to static catalog:", e);
  }

  const priced: PricedLine[] = [];
  for (const line of lines) {
    if (dbProducts) {
      const p = dbProducts.get(line.id);
      if (!p || !p.active) {
        return { priced: [], error: `Product unavailable: ${line.id}` };
      }
      if (!Number.isInteger(p.price_inr) || p.price_inr <= 0) {
        return { priced: [], error: `Invalid price for product: ${line.id}` };
      }
      priced.push({
        productId: line.id,
        sku: p.sku,
        name: p.name,
        unitPriceInr: p.price_inr,
        quantity: line.qty,
        lineTotalInr: p.price_inr * line.qty,
      });
    } else {
      // Static catalog fallback (local / no Supabase)
      const p: Product | undefined = productById.get(line.id);
      if (!p) return { priced: [], error: `Unknown product: ${line.id}` };
      priced.push({
        productId: p.id,
        sku: p.sku,
        name: p.name,
        unitPriceInr: p.priceInr,
        quantity: line.qty,
        lineTotalInr: p.priceInr * line.qty,
      });
    }
  }

  return { priced };
}

/**
 * Create an order with server-authoritative pricing.
 * Inserts into orders + order_items via service role.
 * If Supabase is not configured, returns a priced payload without persistence
 * (useful for local UI testing).
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const lines = sanitizeCartInput(input.lines);
  if (!lines) {
    return { ok: false, error: "Invalid cart", status: 400 };
  }

  const { priced, error } = await resolvePrices(lines);
  if (error || priced.length === 0) {
    return { ok: false, error: error ?? "No valid items", status: 400 };
  }

  const subtotalInr = priced.reduce((s, l) => s + l.lineTotalInr, 0);
  const shippingInr = 0; // complimentary insured shipping
  const totalInr = subtotalInr + shippingInr;
  const itemCount = priced.reduce((n, l) => n + l.quantity, 0);

  // Persist only when service role is available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: true,
      orderId: `local-${Date.now()}`,
      subtotalInr,
      shippingInr,
      totalInr,
      itemCount,
      lines: priced,
    };
  }

  const supabase = createServiceClient();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId ?? null,
      guest_email: input.guestEmail ?? null,
      status: "pending",
      currency: "INR",
      subtotal_inr: subtotalInr,
      shipping_inr: shippingInr,
      total_inr: totalInr,
      item_count: itemCount,
      shipping_name: input.shipping?.name ?? null,
      shipping_phone: input.shipping?.phone ?? null,
      shipping_line1: input.shipping?.line1 ?? null,
      shipping_line2: input.shipping?.line2 ?? null,
      shipping_city: input.shipping?.city ?? null,
      shipping_state: input.shipping?.state ?? null,
      shipping_postal: input.shipping?.postal ?? null,
      shipping_country: input.shipping?.country ?? "IN",
      notes: input.notes ?? null,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    console.error("[orders] insert order failed:", orderErr?.message);
    return { ok: false, error: "Could not create order", status: 500 };
  }

  const orderId = order.id as string;

  const itemRows = priced.map((l) => ({
    order_id: orderId,
    product_id: l.productId,
    sku: l.sku,
    name: l.name,
    unit_price_inr: l.unitPriceInr,
    quantity: l.quantity,
    line_total_inr: l.lineTotalInr,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(itemRows);
  if (itemsErr) {
    console.error("[orders] insert items failed:", itemsErr.message);
    // Best-effort rollback
    await supabase.from("orders").delete().eq("id", orderId);
    return { ok: false, error: "Could not create order items", status: 500 };
  }

  return {
    ok: true,
    orderId,
    subtotalInr,
    shippingInr,
    totalInr,
    itemCount,
    lines: priced,
  };
}
