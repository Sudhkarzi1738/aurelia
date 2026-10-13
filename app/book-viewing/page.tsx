import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Book a Viewing — AURELIA" };

export default function Page() {
  return (
    <article className="content-page">
      <div className="content-inner">
        <div className="eyebrow">Private appointments</div>
        <h1 className="serif">{`Book a Viewing`}</h1>
        <div className="content-body">

          <p>
            View selected high jewellery and bridal sets in our Mumbai or Jaipur salon. Appointments last
            about forty-five minutes and include a dedicated advisor.
          </p>
          <p>
            Email <a href="mailto:concierge@aurelia.example">concierge@aurelia.example</a> with your preferred
            city, dates, and the pieces you wish to see. We will confirm within one business day.
          </p>

        </div>
        <p className="content-back">
          <Link href="/">← Back to the maison</Link>
        </p>
      </div>
    </article>
  );
}
