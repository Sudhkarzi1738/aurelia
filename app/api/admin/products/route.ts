import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

const CATEGORIES = new Set(["necklace", "bracelet", "ring", "earrings", "headpiece"]);

/** GET /api/admin/products — list all products (including inactive) */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("products")
    .select("*")
    .order("sku", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ products: data ?? [] });
}

/** POST /api/admin/products — create product */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const p = body as Record<string, unknown>;
  const id = typeof p.id === "string" ? p.id.trim() : "";
  const sku = typeof p.sku === "string" ? p.sku.trim() : "";
  const name = typeof p.name === "string" ? p.name.trim() : "";
  const category = typeof p.category === "string" ? p.category : "";
  const tag = typeof p.tag === "string" ? p.tag : "";
  const price_inr = typeof p.price_inr === "number" ? Math.floor(p.price_inr) : NaN;
  const image = typeof p.image === "string" ? p.image : "/assets/placeholder.svg";
  const active = typeof p.active === "boolean" ? p.active : true;

  if (!id || !sku || !name || !CATEGORIES.has(category) || !Number.isFinite(price_inr) || price_inr <= 0) {
    return NextResponse.json({ error: "Invalid product fields" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("products")
    .insert({
      id,
      sku,
      name,
      category,
      tag,
      price_inr,
      image,
      active,
      image_verified: false,
      specs_verified: false,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ product: data }, { status: 201 });
}

/** PATCH /api/admin/products — update by id */
export async function PATCH(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const p = body as Record<string, unknown>;
  const id = typeof p.id === "string" ? p.id.trim() : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (typeof p.sku === "string") patch.sku = p.sku.trim();
  if (typeof p.name === "string") patch.name = p.name.trim();
  if (typeof p.category === "string" && CATEGORIES.has(p.category)) patch.category = p.category;
  if (typeof p.tag === "string") patch.tag = p.tag;
  if (typeof p.price_inr === "number" && p.price_inr > 0) patch.price_inr = Math.floor(p.price_inr);
  if (typeof p.image === "string") patch.image = p.image;
  if (typeof p.active === "boolean") patch.active = p.active;
  if (typeof p.image_verified === "boolean") patch.image_verified = p.image_verified;
  if (typeof p.specs_verified === "boolean") patch.specs_verified = p.specs_verified;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("products")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ product: data });
}

/** DELETE /api/admin/products?id=... — soft-deactivate (active=false) */
export async function DELETE(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("products")
    .update({ active: false })
    .eq("id", id)
    .select("id, active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ product: data });
}
