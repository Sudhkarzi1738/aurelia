import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, CATEGORY_LABEL, inr, type Product } from "@/lib/products";
import { ProductActions } from "@/components/ProductActions";
import Link from "next/link";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = products.find((x) => x.id === id);
  if (!p) return { title: "Piece not found — AURELIA" };
  return {
    title: `${p.name} — AURELIA`,
    description: `${p.name} · ${CATEGORY_LABEL[p.category]} · ${inr(p.priceInr)}`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((x) => x.id === id);
  if (!product) notFound();

  const related = products
    .filter((x) => x.category === product.category && x.id !== product.id)
    .slice(0, 4);

  return (
    <div className="pdp">
      <div className="pdp-crumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/#${product.category === "headpiece" ? "bridal" : product.category + "s"}`}>
          {CATEGORY_LABEL[product.category]}
        </Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="pdp-grid">
        <div className="pdp-gallery">
          <div className="pdp-main-img">
            <img src={product.image} alt={product.name} />
          </div>
          {product.tag && <div className="pdp-tag">{product.tag}</div>}
        </div>

        <div className="pdp-info">
          <div className="eyebrow">{CATEGORY_LABEL[product.category]}</div>
          <h1 className="serif">{product.name}</h1>
          <div className="pdp-sku">SKU · {product.sku}</div>
          <div className="pdp-price">
            <b>{inr(product.priceInr)}</b>
            <span>Inclusive of all taxes · Complimentary insured shipping</span>
          </div>

          <ul className="pdp-bullets">
            <li>Hand-finished in our Jaipur atelier</li>
            <li>Lifetime craftsmanship warranty</li>
            <li>Certificate of authenticity on request</li>
            {!product.specsVerified && (
              <li className="muted">Metal purity &amp; gem certification details available from Concierge</li>
            )}
          </ul>

          <ProductActions productId={product.id} productName={product.name} />

          <div className="pdp-note">
            <p>
              Each piece is composed to order or drawn from a limited atelier stock. Allow 3–7 days for dispatch
              on most designs; high jewellery may require longer.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pdp-related">
          <div className="sec-head">
            <div className="eyebrow">You may also like</div>
            <h2>From the same house</h2>
          </div>
          <div className="grid related-grid">
            {related.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className="card related-card">
                <div className="card-img">
                  <img src={p.image} alt={p.name} loading="lazy" />
                </div>
                <div className="card-body">
                  <div className="card-cat">{CATEGORY_LABEL[p.category]}</div>
                  <div className="card-name">{p.name}</div>
                  <div className="card-price">
                    <b>{inr(p.priceInr)}</b>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
