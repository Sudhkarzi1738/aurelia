"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  orders: number;
  paid: number;
  revenue: number;
  products: number;
  active: number;
  error?: string;
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [oRes, pRes] = await Promise.all([
          fetch("/api/admin/orders?limit=200"),
          fetch("/api/admin/products"),
        ]);
        if (oRes.status === 401 || oRes.status === 403 || pRes.status === 401 || pRes.status === 403) {
          setStats({ orders: 0, paid: 0, revenue: 0, products: 0, active: 0, error: "Admin access required. Sign in with an admin account." });
          return;
        }
        const oData = await oRes.json();
        const pData = await pRes.json();
        const orders = (oData.orders ?? []) as { status: string; total_inr: number }[];
        const products = (pData.products ?? []) as { active: boolean }[];
        const paid = orders.filter((o) => o.status === "paid" || o.status === "fulfilled");
        setStats({
          orders: orders.length,
          paid: paid.length,
          revenue: paid.reduce((s, o) => s + (o.total_inr ?? 0), 0),
          products: products.length,
          active: products.filter((p) => p.active).length,
        });
      } catch {
        setStats({ orders: 0, paid: 0, revenue: 0, products: 0, active: 0, error: "Could not load stats" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="admin-muted">Loading…</p>;

  if (stats?.error) {
    return (
      <div className="admin-card">
        <h1 className="serif">Admin</h1>
        <p className="admin-err">{stats.error}</p>
        <p className="admin-muted">
          Promote a user in Supabase SQL:{" "}
          <code>update public.profiles set role = &apos;admin&apos; where email = &apos;you@example.com&apos;;</code>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="serif admin-title">Overview</h1>
      <div className="admin-stats">
        <div className="admin-stat">
          <span>Orders (recent)</span>
          <b>{stats?.orders ?? 0}</b>
        </div>
        <div className="admin-stat">
          <span>Paid / fulfilled</span>
          <b>{stats?.paid ?? 0}</b>
        </div>
        <div className="admin-stat">
          <span>Revenue (INR)</span>
          <b>₹ {(stats?.revenue ?? 0).toLocaleString("en-IN")}</b>
        </div>
        <div className="admin-stat">
          <span>Products active</span>
          <b>
            {stats?.active ?? 0} / {stats?.products ?? 0}
          </b>
        </div>
      </div>
      <div className="admin-quick">
        <Link className="btn btn-solid" href="/admin/orders">
          Manage orders
        </Link>
        <Link className="btn" href="/admin/products">
          Manage products
        </Link>
      </div>
    </div>
  );
}
