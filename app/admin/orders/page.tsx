"use client";

import { useCallback, useEffect, useState } from "react";

type OrderItem = {
  id: string;
  sku: string;
  name: string;
  unit_price_inr: number;
  quantity: number;
  line_total_inr: number;
};

type Order = {
  id: string;
  status: string;
  total_inr: number;
  subtotal_inr: number;
  item_count: number;
  guest_email: string | null;
  user_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
  order_items?: OrderItem[];
};

const STATUSES = ["pending", "payment_pending", "paid", "failed", "cancelled", "fulfilled", "refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const q = filter ? `?status=${filter}&limit=100` : "?limit=100";
    const res = await fetch(`/api/admin/orders${q}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to load orders");
      setOrders([]);
      return;
    }
    setOrders(data.orders ?? []);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="serif admin-title">Orders</h1>
      <div className="admin-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn" type="button" onClick={load}>
          Refresh
        </button>
      </div>
      {error && <p className="admin-err">{error}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Created</th>
              <th>ID</th>
              <th>Status</th>
              <th>Total</th>
              <th>Items</th>
              <th>Email</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="admin-muted">
                  No orders
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{new Date(o.created_at).toLocaleString("en-IN")}</td>
                <td>
                  <code title={o.id}>{o.id.slice(0, 8)}…</code>
                </td>
                <td>
                  <span className={`admin-badge status-${o.status}`}>{o.status}</span>
                </td>
                <td>₹ {o.total_inr.toLocaleString("en-IN")}</td>
                <td>{o.item_count}</td>
                <td>{o.guest_email ?? "—"}</td>
                <td>
                  {o.razorpay_payment_id ? (
                    <code title={o.razorpay_payment_id}>{o.razorpay_payment_id.slice(0, 10)}…</code>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <select
                    disabled={busy === o.id}
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) setStatus(o.id, e.target.value);
                      e.target.value = "";
                    }}
                  >
                    <option value="">Set status…</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
