import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Our Story — AURELIA" };

export default function Page() {
  return (
    <article className="content-page">
      <div className="content-inner">
        <div className="eyebrow">Maison · Est. 1987</div>
        <h1 className="serif">{`Our Story`}</h1>
        <div className="content-body">

          <p>
            Aurelia began in a small Jaipur workshop in 1987, when a goldsmith and a stone-setter decided
            that every piece leaving their bench should be worthy of becoming an heirloom. Four decades on,
            the maison still works by the same rule: light, weight, and time — never rushed.
          </p>
          <p>
            Today our ateliers span Jaipur, Mumbai, and a quiet studio in Paris. We set kundan by hand,
            cut no-heat gemstones where nature allows, and finish every clasp as carefully as the face of
            the jewel. The result is jewellery meant to be worn, lived in, and passed on.
          </p>

        </div>
        <p className="content-back">
          <Link href="/">← Back to the maison</Link>
        </p>
      </div>
    </article>
  );
}
