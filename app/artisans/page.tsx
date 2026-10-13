import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Artisans — AURELIA" };

export default function Page() {
  return (
    <article className="content-page">
      <div className="content-inner">
        <div className="eyebrow">The hands behind the light</div>
        <h1 className="serif">{`Artisans`}</h1>
        <div className="content-body">

          <p>
            More than one hundred and twenty master artisans work with Aurelia — setters, engravers,
            enamelers, and polishers whose skills were often learned at a parent&apos;s bench. Many designs
            still require weeks of continuous work by a single pair of hands.
          </p>
          <p>
            We credit the craft, not the machine. When a piece carries our mark, it carries their patience.
          </p>

        </div>
        <p className="content-back">
          <Link href="/">← Back to the maison</Link>
        </p>
      </div>
    </article>
  );
}
