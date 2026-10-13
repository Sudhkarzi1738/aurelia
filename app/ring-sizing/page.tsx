import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ring Sizing — AURELIA" };

export default function Page() {
  return (
    <article className="content-page">
      <div className="content-inner">
        <div className="eyebrow">A precise fit</div>
        <h1 className="serif">{`Ring Sizing`}</h1>
        <div className="content-body">

          <p>
            Indian, US, and UK size charts are available from Concierge. For stackable and eternity bands we
            recommend a professional measurement; we can arrange a sizing kit for bridal orders.
          </p>
          <p>
            Resizing of solid gold bands is offered once within six months of purchase on eligible designs.
            Contact Care &amp; Repair for details.
          </p>

        </div>
        <p className="content-back">
          <Link href="/">← Back to the maison</Link>
        </p>
      </div>
    </article>
  );
}
