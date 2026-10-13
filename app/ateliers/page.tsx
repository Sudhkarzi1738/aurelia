import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ateliers — AURELIA" };

export default function Page() {
  return (
    <article className="content-page">
      <div className="content-inner">
        <div className="eyebrow">Jaipur · Mumbai · Paris</div>
        <h1 className="serif">{`Ateliers`}</h1>
        <div className="content-body">

          <p>
            <strong>Jaipur</strong> remains the heart of high jewellery and temple craft — where kundan,
            polki, and meenakari still define the house language.
          </p>
          <p>
            <strong>Mumbai</strong> hosts our client atelier and bridal fittings, with private viewing salons
            by appointment.
          </p>
          <p>
            <strong>Paris</strong> is a smaller studio dedicated to contemporary lines and European clientele,
            keeping the same finishing standards as the Indian houses.
          </p>

        </div>
        <p className="content-back">
          <Link href="/">← Back to the maison</Link>
        </p>
      </div>
    </article>
  );
}
