"use client";
import Link from "next/link";
import { useState } from "react";
import {
  CATEGORY_LABEL,
  displayProductName,
  inr,
  RING_SIZES,
  type Category,
  type Product,
} from "@/lib/products";
import { useStore } from "./Providers";

const PAGE = 12;

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconHeart({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s-6.5-4.35-9.33-7.18C.9 12.05.5 9.5 2.1 7.6 3.5 5.9 5.9 5.5 7.7 6.7c1 .7 1.7 1.6 2.3 2.5.6-.9 1.3-1.8 2.3-2.5 1.8-1.2 4.2-.8 5.6.9 1.6 1.9 1.2 4.45-.57 6.22C18.5 16.65 12 21 12 21z" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  const { wishlist, toggleWishlist, openLightbox, addToCart } = useStore();
  const [visible, setVisible] = useState(PAGE);
  const [sizeFor, setSizeFor] = useState<Product | null>(null);
  const [size, setSize] = useState("7");

  const slice = items.slice(0, visible);
  const more = items.length - visible;

  function onAdd(p: Product) {
    if (p.needsSize || p.category === "ring") {
      setSizeFor(p);
      setSize("7");
      return;
    }
    addToCart(p.id);
  }

  function confirmSize() {
    if (!sizeFor) return;
    addToCart(sizeFor.id);
    setSizeFor(null);
  }

  return (
    <>
      <div className="grid">
        {slice.map((p, i) => {
          const loved = wishlist.includes(p.id);
          return (
            <article className="card" key={p.id} style={{ animationDelay: `${(i % 8) * 0.05}s` }}>
              <div className="card-img">
                <Link href={`/product/${p.id}`} aria-label={p.name}>
                  <img src={p.image} alt={p.name} width={400} height={500} loading="lazy" decoding="async" />
                </Link>
                {p.tag && <div className="card-tag">{p.tag}</div>}
                <div className="card-actions">
                  <button type="button" className="icon-btn" aria-label="Quick view" onClick={() => openLightbox(p.image)}>
                    <IconEye />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={loved ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={() => toggleWishlist(p.id, p.name)}
                  >
                    <IconHeart filled={loved} />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="card-cat">{CATEGORY_LABEL[p.category as Category]}</div>
                <Link href={`/product/${p.id}`} className="card-name" title={p.name}>
                  {displayProductName(p.name)}
                </Link>
                {p.material && <p className="card-material">{p.material}</p>}
                <div className="card-price">
                  <b>{inr(p.priceInr)}</b>
                </div>
                <button type="button" className="btn add-btn" onClick={() => onAdd(p)}>
                  Add to Bag
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {more > 0 && (
        <div className="load-more-wrap">
          <p className="load-more-meta">
            Showing {slice.length} of {items.length}
          </p>
          <button type="button" className="btn" onClick={() => setVisible((v) => v + PAGE)}>
            Load more · {Math.min(PAGE, more)} pieces
          </button>
        </div>
      )}

      {sizeFor && (
        <div
          className="size-scrim open"
          role="dialog"
          aria-modal="true"
          aria-label="Select size"
          onClick={(e) => e.target === e.currentTarget && setSizeFor(null)}
        >
          <div className="size-sheet">
            <h3 className="serif">Select size</h3>
            <p className="size-product">{sizeFor.name}</p>
            <div className="size-grid" role="listbox">
              {RING_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="option"
                  aria-selected={size === s}
                  className={size === s ? "size-chip active" : "size-chip"}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="size-help">
              <Link href="/ring-sizing">Ring sizing guide</Link>
            </p>
            <button type="button" className="btn btn-solid" onClick={confirmSize}>
              Add to Bag
            </button>
            <button type="button" className="link-btn" onClick={() => setSizeFor(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
