/**
 * Offline smoke tests — no network, no Supabase required.
 * Run: node scripts/smoke-test.mjs
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHmac, timingSafeEqual } from "crypto";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}${detail ? " — " + detail : ""}`);
    failed++;
  }
}

console.log("\nAurelia smoke tests\n");

// --- Catalog integrity ---
console.log("Catalog");
const productsTs = readFileSync(join(root, "lib/products.ts"), "utf8");
const ids = [...productsTs.matchAll(/"id":\s*"([^"]+)"/g)].map((m) => m[1]);
const skus = [...productsTs.matchAll(/"sku":\s*"([^"]+)"/g)].map((m) => m[1]);
const prices = [...productsTs.matchAll(/"priceInr":\s*(\d+)/g)].map((m) => Number(m[1]));
ok("has 50 products", ids.length === 50, `got ${ids.length}`);
ok("unique ids", new Set(ids).size === ids.length);
ok("unique skus", new Set(skus).size === skus.length);
ok("all prices > 0", prices.every((p) => p > 0));

// --- Required routes exist ---
console.log("\nRoutes & files");
const required = [
  "app/page.tsx",
  "app/product/[id]/page.tsx",
  "app/checkout/page.tsx",
  "app/our-story/page.tsx",
  "app/contact/page.tsx",
  "app/care/page.tsx",
  "app/admin/page.tsx",
  "app/api/checkout/route.ts",
  "app/api/checkout/verify/route.ts",
  "app/api/webhooks/razorpay/route.ts",
  "app/api/admin/orders/route.ts",
  "app/api/admin/products/route.ts",
  "lib/razorpay.ts",
  "lib/orders.ts",
  "components/SiteFooter.tsx",
  "components/ProductActions.tsx",
  "supabase/migrations/20261013_phase5_schema.sql",
  "supabase/migrations/20261013_phase5_seed_products.sql",
  "DEPLOY.md",
];
for (const f of required) {
  ok(f, existsSync(join(root, f)));
}

// --- Razorpay signature algorithm ---
console.log("\nRazorpay HMAC");
function verifyPayment(orderId, paymentId, signature, secret) {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
const secret = "test_secret_key";
const oid = "order_ABC";
const pid = "pay_XYZ";
const good = createHmac("sha256", secret).update(`${oid}|${pid}`).digest("hex");
ok("valid payment signature accepted", verifyPayment(oid, pid, good, secret));
ok("tampered signature rejected", !verifyPayment(oid, pid, good.replace(/0/g, "1"), secret));
ok("wrong secret rejected", !verifyPayment(oid, pid, good, "other"));

function verifyWebhook(body, signature, whSecret) {
  const expected = createHmac("sha256", whSecret).update(body).digest("hex");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
const body = JSON.stringify({ event: "payment.captured" });
const wh = createHmac("sha256", "whsec").update(body).digest("hex");
ok("valid webhook signature accepted", verifyWebhook(body, wh, "whsec"));
ok("invalid webhook signature rejected", !verifyWebhook(body, wh, "wrong"));

// --- Cart sanitize rules (mirror lib/orders.ts) ---
console.log("\nCart sanitize rules");
function sanitize(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 30) return null;
  const merged = new Map();
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const qty = typeof item.qty === "number" && Number.isFinite(item.qty) ? Math.floor(item.qty) : NaN;
    if (!id || !Number.isFinite(qty) || qty < 1) return null;
    merged.set(id, Math.min(10, (merged.get(id) ?? 0) + qty));
  }
  if (merged.size === 0) return null;
  return [...merged].map(([id, qty]) => ({ id, qty }));
}
ok("merges duplicate lines", JSON.stringify(sanitize([{ id: "a", qty: 2 }, { id: "a", qty: 3 }])) === JSON.stringify([{ id: "a", qty: 5 }]));
ok("caps qty at 10", sanitize([{ id: "a", qty: 99 }])[0].qty === 10);
ok("rejects empty", sanitize([]) === null);
ok("rejects bad qty", sanitize([{ id: "a", qty: 0 }]) === null);

// --- Seed SQL product count ---
console.log("\nSeed SQL");
const seed = readFileSync(join(root, "supabase/migrations/20261013_phase5_seed_products.sql"), "utf8");
const seedRows = (seed.match(/^\s*\('/gm) || []).length;
ok("seed has 50 product rows", seedRows === 50, `got ${seedRows}`);
ok("seed uses on conflict", /on conflict \(id\) do update/i.test(seed));

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
