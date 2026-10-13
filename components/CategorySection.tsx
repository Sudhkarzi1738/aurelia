import { products, type Category } from "@/lib/products";
import { ProductGrid } from "./ProductGrid";

export function CategorySection(p: { id: string; cat: Category; eyebrow: string; title: string; sub: string; alt?: boolean }) {
  const style = p.alt ? { background: "var(--bg2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" } : undefined;
  return (
    <section id={p.id} style={style}>
      <div className="sec-head"><div className="eyebrow">{p.eyebrow}</div><h2>{p.title}</h2><p>{p.sub}</p></div>
      <ProductGrid items={products.filter(x => x.category === p.cat)} />
    </section>
  );
}
