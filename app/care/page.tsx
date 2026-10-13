import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Care & Repair — AURELIA" };

export default function Page() {
  return (
    <article className="content-page">
      <div className="content-inner">
        <div className="eyebrow">Lifetime craftsmanship</div>
        <h1 className="serif">{`Care & Repair`}</h1>
        <div className="content-body">

          <p>
            Every Aurelia piece carries a lifetime craftsmanship warranty against manufacturing defects.
            Cleaning, re-tipping of claws, and clasp service are available through our ateliers.
          </p>
          <p>
            Store pieces separately in the soft pouch provided. Avoid perfume and chlorine on finished gold
            and gemstones. For service, write to{" "}
            <a href="mailto:care@aurelia.example">care@aurelia.example</a> with your SKU and order reference.
          </p>

        </div>
        <p className="content-back">
          <Link href="/">← Back to the maison</Link>
        </p>
      </div>
    </article>
  );
}
