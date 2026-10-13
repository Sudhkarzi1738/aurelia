import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin — AURELIA" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <header className="admin-top">
        <a href="/" className="logo">
          AURE<span>LIA</span>
        </a>
        <nav className="admin-nav">
          <Link href="/admin">Overview</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/products">Products</Link>
          <a href="/">← Storefront</a>
        </nav>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
