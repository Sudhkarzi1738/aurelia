import { CATEGORY_LABEL, products, type Category, type Product } from "./products";

export const productById = new Map<string, Product>(products.map(p => [p.id, p]));

/* ---------- Sorting ---------- */
export type SortKey = "featured" | "price-asc" | "price-desc" | "name";
export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "name", label: "Name: A to Z" },
];

/* ---------- Price bands (all bounds inclusive) ---------- */
export interface PriceBand { label: string; min: number | null; max: number | null }
export const PRICE_BANDS: PriceBand[] = [
  { label: "Up to ₹25K", min: null, max: 25_000 },
  { label: "₹25K – ₹50K", min: 25_000, max: 50_000 },
  { label: "₹50K – ₹1L", min: 50_000, max: 100_000 },
  { label: "₹1L – ₹5L", min: 100_000, max: 500_000 },
  { label: "₹5L & above", min: 500_000, max: null },
];

/** "12,000" / "₹ 12000" / "" -> number | null. Digits only; anything else is ignored. */
export function parsePrice(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  return digits === "" ? null : Number(digits);
}

/* ---------- Filtering ---------- */
export interface Filters {
  category: Category | "all";
  query: string;
  min: number | null;
  max: number | null;
  sort: SortKey;
}
export const DEFAULT_FILTERS: Filters = { category: "all", query: "", min: null, max: null, sort: "featured" };

const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function matchesQuery(p: Product, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const hay = `${p.name} ${CATEGORY_LABEL[p.category]} ${p.category} ${p.tag} ${p.sku}`.toLowerCase();
  const hayCompact = compact(hay);
  // every word must match; the compact fallback lets "mangal sutra" find "Mangalsutra"
  return tokens.every(t => hay.includes(t) || hayCompact.includes(compact(t)));
}

export function applyFilters(all: Product[], f: Filters): Product[] {
  const tokens = f.query.toLowerCase().split(/\s+/).filter(Boolean);
  // tolerate min > max by swapping rather than showing an empty page
  let lo = f.min, hi = f.max;
  if (lo !== null && hi !== null && lo > hi) [lo, hi] = [hi, lo];

  const out = all.filter(p =>
    (f.category === "all" || p.category === f.category) &&
    (lo === null || p.priceInr >= lo) &&
    (hi === null || p.priceInr <= hi) &&
    matchesQuery(p, tokens)
  );

  switch (f.sort) {
    case "price-asc": return out.sort((a, b) => a.priceInr - b.priceInr);
    case "price-desc": return out.sort((a, b) => b.priceInr - a.priceInr);
    case "name": return out.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
    default: return out; // catalog order; Array#sort is stable so ties keep it too
  }
}

/** True when anything other than the category/sort has been narrowed (used for "Clear" affordance). */
export const hasActiveFilters = (f: Filters) =>
  f.category !== "all" || f.query.trim() !== "" || f.min !== null || f.max !== null || f.sort !== "featured";
