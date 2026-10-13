import Link from "next/link";

export default function NotFound() {
  return (
    <div className="content-page" style={{ textAlign: "center" }}>
      <div className="eyebrow">404</div>
      <h1 className="serif">Piece not found</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        This page or product is no longer in the atelier.
      </p>
      <Link className="btn btn-solid" href="/">
        Return home
      </Link>
    </div>
  );
}
