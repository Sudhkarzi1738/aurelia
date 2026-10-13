"use client";

import { useCallback, useEffect, useState } from "react";

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  tag: string;
  price_inr: number;
  image: string;
  active: boolean;
};

const CATEGORIES = ["necklace", "bracelet", "ring", "earrings", "headpiece"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [edit, setEdit] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const empty: Product = {
    id: "",
    sku: "",
    name: "",
    category: "necklace",
    tag: "",
    price_inr: 0,
    image: "/assets/placeholder.svg",
    active: true,
  };

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/admin/products");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to load");
      setProducts([]);
      return;
    }
    setProducts(data.products ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!edit) return;
    setMsg(null);
    setError(null);
    const isNew = creating;
    const res = await fetch("/api/admin/products", {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setMsg(isNew ? "Product created" : "Product updated");
    setEdit(null);
    setCreating(false);
    await load();
  }

  async function deactivate(id: string) {
    if (!confirm(`Deactivate ${id}?`)) return;
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    setMsg("Deactivated");
    await load();
  }

  return (
    <div>
      <h1 className="serif admin-title">Products</h1>
      <div className="admin-toolbar">
        <button
          className="btn btn-solid"
          type="button"
          onClick={() => {
            setCreating(true);
            setEdit({ ...empty });
          }}
        >
          New product
        </button>
        <button className="btn" type="button" onClick={load}>
          Refresh
        </button>
      </div>
      {error && <p className="admin-err">{error}</p>}
      {msg && <p className="admin-msg">{msg}</p>}

      {edit && (
        <div className="admin-card admin-form">
          <h3 className="serif">{creating ? "Create product" : `Edit ${edit.id}`}</h3>
          <div className="admin-form-grid">
            <label>
              ID
              <input
                value={edit.id}
                disabled={!creating}
                onChange={(e) => setEdit({ ...edit, id: e.target.value })}
              />
            </label>
            <label>
              SKU
              <input value={edit.sku} onChange={(e) => setEdit({ ...edit, sku: e.target.value })} />
            </label>
            <label className="full">
              Name
              <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </label>
            <label>
              Category
              <select
                value={edit.category}
                onChange={(e) => setEdit({ ...edit, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tag
              <input value={edit.tag} onChange={(e) => setEdit({ ...edit, tag: e.target.value })} />
            </label>
            <label>
              Price (INR)
              <input
                type="number"
                min={1}
                value={edit.price_inr || ""}
                onChange={(e) => setEdit({ ...edit, price_inr: Number(e.target.value) })}
              />
            </label>
            <label>
              Image path
              <input value={edit.image} onChange={(e) => setEdit({ ...edit, image: e.target.value })} />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={edit.active}
                onChange={(e) => setEdit({ ...edit, active: e.target.checked })}
              />
              Active
            </label>
          </div>
          <div className="admin-form-actions">
            <button className="btn btn-solid" type="button" onClick={save}>
              Save
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setEdit(null);
                setCreating(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={p.active ? "" : "inactive"}>
                <td>
                  <code>{p.sku}</code>
                </td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹ {p.price_inr.toLocaleString("en-IN")}</td>
                <td>{p.active ? "yes" : "no"}</td>
                <td className="admin-row-actions">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setCreating(false);
                      setEdit({ ...p });
                    }}
                  >
                    Edit
                  </button>
                  {p.active && (
                    <button type="button" className="link-btn" onClick={() => deactivate(p.id)}>
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
