"use client";
/** Shop-by-category tiles — applies filter on the main Collections grid instead of duplicating products */

const TILES: { cat: string; label: string; href: string; image: string }[] = [
  { cat: "necklace", label: "Necklaces", href: "/#collections", image: "/assets/necklace-kundan.webp" },
  { cat: "bracelet", label: "Bracelets", href: "/#collections", image: "/assets/bracelet-kundan.webp" },
  { cat: "ring", label: "Rings", href: "/#collections", image: "/assets/ring-eternity.webp" },
  { cat: "earrings", label: "Earrings", href: "/#collections", image: "/assets/earrings-chandbali.webp" },
  { cat: "headpiece", label: "Bridal & Hair", href: "/#collections", image: "/assets/headpiece-mathapatti.webp" },
];

export function ShopByCategory() {
  function pick(cat: string) {
    window.dispatchEvent(new CustomEvent("aurelia:category", { detail: cat }));
    const el = document.getElementById("collections");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="shop-by" className="shop-by">
      <div className="sec-head">
        <div className="eyebrow">Browse</div>
        <h2>Shop by Category</h2>
        <p>Five houses of craft — one signature of light.</p>
      </div>
      <div className="shop-tiles">
        {TILES.map((t) => (
          <button
            key={t.cat}
            type="button"
            className="shop-tile"
            onClick={() => pick(t.cat)}
            aria-label={`Shop ${t.label}`}
          >
            <img src={t.image} alt="" width={320} height={400} loading="lazy" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/** @deprecated use ShopByCategory — kept for import compatibility */
export function CategorySection(_p: {
  id: string;
  cat: string;
  eyebrow: string;
  title: string;
  sub: string;
  alt?: boolean;
}) {
  return null;
}

