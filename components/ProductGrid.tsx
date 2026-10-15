"use client";
import Link from "next/link";
import { CATEGORY_LABEL, inr, type Category, type Product } from "@/lib/products";
import { useStore } from "./Providers";

export function ProductGrid({ items }: { items: Product[] }) {
  const { wishlist, toggleWishlist, openLightbox, addToCart } = useStore();
  return (
    <div className="grid">
      {items.map((p, i) => (
        <article className="card" key={p.id} style={{ animationDelay: `${(i % 8) * 0.06}s` }}>
          <div className="card-img">
            <Link href={`/product/${p.id}`} aria-label={p.name}>
              <img src={p.image} alt={p.name} loading="lazy" />
            </Link>
            <div className="card-tag">{p.tag}</div>
            <div className="card-actions">
              <button className="icon-btn" title="Quick view" type="button" aria-label="Quick view" onClick={() => openLightbox(p.image)}>
                👁
              </button>
              <button
                className="icon-btn"
                title="Add to wishlist"
                type="button"
                aria-label="Wishlist"
                onClick={() => toggleWishlist(p.id, p.name)}
              >
                {wishlist.includes(p.id) ? "♥" : "♡"}
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="card-cat">{CATEGORY_LABEL[p.category as Category]}</div>
            <Link href={`/product/${p.id}`} className="card-name">
              {p.name}
            </Link>
            <div className="card-price">
              <b>{inr(p.priceInr)}</b>
              <span className="card-tax"> · incl. taxes</span>
            </div>
            <button className="btn add-btn" type="button" onClick={() => addToCart(p.id)}>
              Add to Bag
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
