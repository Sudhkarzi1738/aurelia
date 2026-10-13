import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact — AURELIA" };

export default function Page() {
  return (
    <article className="content-page">
      <div className="content-inner">
        <div className="eyebrow">Concierge</div>
        <h1 className="serif">{`Contact`}</h1>
        <div className="content-body">

          <p>
            Our concierge team responds within one business day. For urgent bridal fittings, please mark your
            message accordingly.
          </p>
          <ul>
            <li>Email: <a href="mailto:concierge@aurelia.example">concierge@aurelia.example</a></li>
            <li>WhatsApp Concierge: available on request after first contact</li>
            <li>Atelier visits: by appointment only — see Book a Viewing</li>
          </ul>

        </div>
        <p className="content-back">
          <Link href="/">← Back to the maison</Link>
        </p>
      </div>
    </article>
  );
}
