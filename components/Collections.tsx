"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { products, type Category } from "@/lib/products";
import { applyFilters, DEFAULT_FILTERS, hasActiveFilters, parsePrice, PRICE_BANDS, SORT_OPTIONS, type SortKey } from "@/lib/catalog";
import { ProductGrid } from "./ProductGrid";

const F: [Category | "all", string][] = [["all","All"],["necklace","Necklaces"],["bracelet","Bracelets"],["ring","Rings"],["earrings","Earrings"],["headpiece","Bridal & Hair"]];

export function Collections() {
  const [category, setCategory] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const [minRaw, setMinRaw] = useState("");
  const [maxRaw, setMaxRaw] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const searchRef = useRef<HTMLInputElement>(null);

  const filters = useMemo(
    () => ({ category, query, min: parsePrice(minRaw), max: parsePrice(maxRaw), sort }),
    [category, query, minRaw, maxRaw, sort]
  );
  const items = useMemo(() => applyFilters(products, filters), [filters]);
  const active = hasActiveFilters(filters);

  // Nav search icon (or /#search on load) puts the cursor in the search box
  useEffect(() => {
    const focus = () => requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }));
    if (window.location.hash === "#search") focus();
    const onHash = () => { if (window.location.hash === "#search") focus(); };
    window.addEventListener("aurelia:search", focus);
    window.addEventListener("hashchange", onHash);
    return () => { window.removeEventListener("aurelia:search", focus); window.removeEventListener("hashchange", onHash); };
  }, []);

  const clearAll = () => {
    setCategory(DEFAULT_FILTERS.category); setQuery(""); setMinRaw(""); setMaxRaw(""); setSort(DEFAULT_FILTERS.sort);
  };

  return (
    <section id="collections">
      <div className="sec-head">
        <div className="eyebrow">The House</div>
        <h2>Our Collections</h2>
        <p>Five houses of craft — one signature of light.</p>
      </div>
      <div className="filters">
        {F.map(([k, l]) => <button key={k} className={"filter-btn" + (category === k ? " active" : "")} onClick={() => setCategory(k)}>{l}</button>)}
      </div>

      <div className="toolbar" id="search">
        <div className="search-box">
          <input
            ref={searchRef} type="search" value={query} placeholder="Search pieces — kundan, choker, AUR-NEC-004…"
            aria-label="Search jewellery" onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Escape" && setQuery("")}
          />
          {query && <button className="search-clear" onClick={() => { setQuery(""); searchRef.current?.focus(); }} aria-label="Clear search">✕</button>}
        </div>
        <label className="sort-box">
          <span>Sort</span>
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)}>
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </label>
      </div>

      <div className="price-row">
        <span className="price-lbl">Price</span>
        {PRICE_BANDS.map(b => {
          const on = filters.min === b.min && filters.max === b.max;
          return (
            <button key={b.label} className={"chip" + (on ? " active" : "")} aria-pressed={on}
              onClick={() => { // clicking the active band turns it off
                setMinRaw(on || b.min === null ? "" : String(b.min));
                setMaxRaw(on || b.max === null ? "" : String(b.max));
              }}>
              {b.label}
            </button>
          );
        })}
        <span className="range">
          <input inputMode="numeric" placeholder="Min ₹" aria-label="Minimum price" value={minRaw} onChange={e => setMinRaw(e.target.value.replace(/\D/g, ""))} />
          <i>–</i>
          <input inputMode="numeric" placeholder="Max ₹" aria-label="Maximum price" value={maxRaw} onChange={e => setMaxRaw(e.target.value.replace(/\D/g, ""))} />
        </span>
      </div>

      <div className="result-meta" aria-live="polite">
        <span>{items.length === products.length ? `${items.length} pieces` : `${items.length} of ${products.length} pieces`}</span>
        {active && <button className="link-btn" onClick={clearAll}>Clear all</button>}
      </div>

      {items.length === 0 ? (
        <div className="no-results">
          <p className="serif">No pieces match your search</p>
          <small>Try a broader word, a wider price range, or another collection.</small>
          <button className="btn" onClick={clearAll}>Clear filters</button>
        </div>
      ) : <ProductGrid items={items} />}
    </section>
  );
}
