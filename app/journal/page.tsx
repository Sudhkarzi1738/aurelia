import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Journal — AURELIA" };

export default function Page() {
  return (
    <article className="content-page">
      <div className="content-inner">
        <div className="eyebrow">Notes from the maison</div>
        <h1 className="serif">{`Journal`}</h1>
        <div className="content-body">

          <p>
            The Aurelia Journal collects short essays on craft, bridal ritual, and the pieces we are proudest
            of. New entries appear with each seasonal edit.
          </p>
          <p>
            For press and collaboration enquiries, write to{" "}
            <a href="mailto:press@aurelia.example">press@aurelia.example</a>.
          </p>

        </div>
        <p className="content-back">
          <Link href="/">← Back to the maison</Link>
        </p>
      </div>
    </article>
  );
}
