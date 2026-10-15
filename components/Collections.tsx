"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { products, type Category } from "@/lib/products";
import {
  applyFilters,
  DEFAULT_FILTERS,
  hasActiveFilters,
  parsePrice,
  PRICE_BANDS,
  SORT_OPTIONS,
  type SortKey,
} from "@/lib/catalog";
import { ProductGrid } from "./ProductGrid";

const F: [Category | "all", string][] = [
  ["all", "All"],
  ["necklace", "Necklaces"],
  ["bracelet", "Bracelets"],
  ["ring", "Rings"],
  ["earrings", "Earrings"],
  ["headpiece", "Bridal & Hair"],
];

export function Collections() {
  const [category, setCategory] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const [minRaw, setMinRaw] = useState("");
  const [maxRaw, setMaxRaw] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // draft state for mobile drawer (Apply)
  const [dCat, setDCat] = useState<Category | "all">("all");
  const [dQuery, setDQuery] = useState("");
  const [dMin, setDMin] = useState("");
  const [dMax, setDMax] = useState("");
  const [dSort, setDSort] = useState<SortKey>("featured");

  const filters = useMemo(
    () => ({ category, query, min: parsePrice(minRaw), max: parsePrice(maxRaw), sort }),
    [category, query, minRaw, maxRaw, sort]
  );
  const items = useMemo(() => applyFilters(products, filters), [filters]);
  const active = hasActiveFilters(filters);

  useEffect(() => {
    const focus = () => requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }));
    if (typeof window !== "undefined" && window.location.hash === "#search") focus();
    const onHash = () => {
      if (window.location.hash === "#search") focus();
    };
    const onSearch = () => focus();
    const onCat = (e: Event) => {
      const cat = (e as CustomEvent).detail as Category | "all";
      if (cat) setCategory(cat);
    };
    window.addEventListener("aurelia:search", onSearch);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("aurelia:category", onCat);
    return () => {
      window.removeEventListener("aurelia:search", onSearch);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("aurelia:category", onCat);
    };
  }, []);

  const clearAll = () => {
    setCategory(DEFAULT_FILTERS.category);
    setQuery("");
    setMinRaw("");
    setMaxRaw("");
    setSort(DEFAULT_FILTERS.sort);
  };

  function openDrawer() {
    setDCat(category);
    setDQuery(query);
    setDMin(minRaw);
    setDMax(maxRaw);
    setDSort(sort);
    setDrawerOpen(true);
  }

  function applyDrawer() {
    setCategory(dCat);
    setQuery(dQuery);
    setMinRaw(dMin);
    setMaxRaw(dMax);
    setSort(dSort);
    setDrawerOpen(false);
  }

  return (
    <section id="collections">
      <div className="sec-head">
        <div className="eyebrow">The House</div>
        <h2>Our Collections</h2>
        <p>Fifty pieces across five houses — prices include taxes.</p>
      </div>

      {/* Desktop / tablet inline filters */}
      <div className="filters filters-desktop" role="tablist" aria-label="Category">
        {F.map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={category === k}
            className={"filter-btn" + (category === k ? " active" : "")}
            onClick={() => setCategory(k)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="toolbar toolbar-desktop" id="search">
        <div className="search-box">
          <label htmlFor="collection-search" className="sr-only">
            Search jewellery
          </label>
          <input
            id="collection-search"
            ref={searchRef}
            type="search"
            value={query}
            placeholder="Search pieces — kundan, choker, AUR-NEC-004…"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <label className="sort-box" htmlFor="sort-select">
          <span>Sort by</span>
          <select id="sort-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="price-row price-row-desktop">
        <span className="price-lbl" id="price-label">
          Price range
        </span>
        {PRICE_BANDS.map((b) => {
          const on = filters.min === b.min && filters.max === b.max;
          return (
            <button
              key={b.label}
              type="button"
              className={"chip" + (on ? " active" : "")}
              aria-pressed={on}
              aria-labelledby="price-label"
              onClick={() => {
                setMinRaw(on || b.min === null ? "" : String(b.min));
                setMaxRaw(on || b.max === null ? "" : String(b.max));
              }}
            >
              {b.label}
            </button>
          );
        })}
        <span className="range">
          <label className="sr-only" htmlFor="price-min">
            Minimum price
          </label>
          <input
            id="price-min"
            inputMode="numeric"
            placeholder="Min ₹"
            value={minRaw}
            onChange={(e) => setMinRaw(e.target.value.replace(/\D/g, ""))}
          />
          <i aria-hidden>–</i>
          <label className="sr-only" htmlFor="price-max">
            Maximum price
          </label>
          <input
            id="price-max"
            inputMode="numeric"
            placeholder="Max ₹"
            value={maxRaw}
            onChange={(e) => setMaxRaw(e.target.value.replace(/\D/g, ""))}
          />
        </span>
      </div>

      {/* Mobile: horizontal category chips + one Filter button */}
      <div className="filters-mobile">
        <div className="chip-scroll" role="tablist" aria-label="Category">
          {F.map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={category === k}
              className={"filter-btn" + (category === k ? " active" : "")}
              onClick={() => setCategory(k)}
            >
              {l}
            </button>
          ))}
        </div>
        <button type="button" className="btn filter-open-btn" onClick={openDrawer}>
          Filter &amp; Sort
        </button>
      </div>

      <div className="result-meta" aria-live="polite">
        <span>
          Showing {items.length} of {products.length} · incl. taxes
        </span>
        {active && (
          <button type="button" className="link-btn" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="no-results">
          <p className="serif">No pieces match your search</p>
          <small>Try a broader word, a wider price range, or another collection.</small>
          <button type="button" className="btn" onClick={clearAll}>
            Clear filters
          </button>
        </div>
      ) : (
        <ProductGrid items={items} />
      )}

      {/* Mobile filter bottom sheet */}
      <div
        className={"filter-scrim" + (drawerOpen ? " open" : "")}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />
      <aside
        className={"filter-sheet" + (drawerOpen ? " open" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="Filter and sort"
        inert={!drawerOpen ? true : undefined}
      >
        <div className="filter-sheet-head">
          <h3 className="serif">Filter &amp; Sort</h3>
          <button type="button" className="drawer-close" aria-label="Close" onClick={() => setDrawerOpen(false)}>
            ✕
          </button>
        </div>
        <div className="filter-sheet-body">
          <label className="filter-field">
            <span>Search</span>
            <input type="search" value={dQuery} onChange={(e) => setDQuery(e.target.value)} placeholder="Search…" />
          </label>
          <fieldset className="filter-field">
            <legend>Category</legend>
            <div className="chip-scroll">
              {F.map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  className={"filter-btn" + (dCat === k ? " active" : "")}
                  onClick={() => setDCat(k)}
                >
                  {l}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="filter-field">
            <span>Sort by</span>
            <select value={dSort} onChange={(e) => setDSort(e.target.value as SortKey)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="filter-field">
            <legend>Price range</legend>
            <div className="chip-scroll">
              {PRICE_BANDS.map((b) => {
                const on = dMin === (b.min === null ? "" : String(b.min)) && dMax === (b.max === null ? "" : String(b.max));
                return (
                  <button
                    key={b.label}
                    type="button"
                    className={"chip" + (on ? " active" : "")}
                    onClick={() => {
                      setDMin(on || b.min === null ? "" : String(b.min));
                      setDMax(on || b.max === null ? "" : String(b.max));
                    }}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
        <div className="filter-sheet-foot">
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setDCat("all");
              setDQuery("");
              setDMin("");
              setDMax("");
              setDSort("featured");
            }}
          >
            Clear
          </button>
          <button type="button" className="btn btn-solid" onClick={applyDrawer}>
            Show {applyFilters(products, { category: dCat, query: dQuery, min: parsePrice(dMin), max: parsePrice(dMax), sort: dSort }).length} pieces
          </button>
        </div>
      </aside>
    </section>
  );
}
