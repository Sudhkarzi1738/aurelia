"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { productById } from "@/lib/catalog";
import type { Product } from "@/lib/products";

export const MAX_QTY = 10; // per piece
const CART_KEY = "aurelia:cart";

/** Only ids + quantities are persisted. Prices are always re-read from the catalog. */
type StoredCart = { id: string; qty: number }[];
export type CartLine = { product: Product; qty: number };

type Ctx = {
  wishlist: string[]; toggleWishlist: (id: string, name: string) => void;
  cart: CartLine[]; cartCount: number; cartTotal: number;
  addToCart: (id: string) => void; setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void; clearCart: () => void;
  cartOpen: boolean; openCart: () => void; closeCart: () => void;
  toast: (m: string) => void; openLightbox: (src: string) => void;
};
const C = createContext<Ctx | null>(null);
export const useStore = () => { const c = useContext(C); if (!c) throw new Error("Providers missing"); return c; };

const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };

/** Drops unknown/removed products, bad quantities and duplicates from whatever is in storage. */
function sanitizeCart(raw: unknown): StoredCart {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, number>();
  for (const l of raw) {
    const id = l && typeof l.id === "string" ? l.id : null;
    const qty = l && Number.isFinite(l.qty) ? Math.floor(l.qty) : 0;
    if (!id || qty < 1 || !productById.has(id)) continue;
    merged.set(id, Math.min(MAX_QTY, (merged.get(id) ?? 0) + qty));
  }
  return [...merged].map(([id, qty]) => ({ id, qty }));
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [stored, setStored] = useState<StoredCart>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [msg, setMsg] = useState(""); const [show, setShow] = useState(false);
  const [lb, setLb] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const storedRef = useRef<StoredCart>([]); // always the latest cart, so rapid clicks never read stale state

  useEffect(() => {
    setWishlist(read("aurelia:wishlist", []));
    const initial = sanitizeCart(read(CART_KEY, []));
    storedRef.current = initial; setStored(initial);
    // keep multiple tabs in step
    const onStorage = (e: StorageEvent) => {
      if (e.key !== CART_KEY) return;
      const next = sanitizeCart(read(CART_KEY, []));
      storedRef.current = next; setStored(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setLb(null); setCartOpen(false); } };
    document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k);
  }, []);

  // stop the page scrolling behind the open drawer
  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  const toast = useCallback((m: string) => {
    setMsg(m); setShow(true); clearTimeout(timer.current); timer.current = setTimeout(() => setShow(false), 2200);
  }, []);

  const toggleWishlist = useCallback((id: string, name: string) => {
    setWishlist(prev => {
      const has = prev.includes(id); const next = has ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem("aurelia:wishlist", JSON.stringify(next)); } catch {}
      toast(has ? `✦ ${name} removed from wishlist` : `✦ ${name} added to wishlist`);
      return next;
    });
  }, [toast]);

  const commit = useCallback((next: StoredCart) => {
    storedRef.current = next; setStored(next);
    try { localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const addToCart = useCallback((id: string) => {
    const p = productById.get(id); if (!p) return;
    const cur = storedRef.current; const line = cur.find(l => l.id === id);
    if (line && line.qty >= MAX_QTY) { toast(`Maximum ${MAX_QTY} per piece`); return; }
    commit(line ? cur.map(l => l.id === id ? { ...l, qty: l.qty + 1 } : l) : [...cur, { id, qty: 1 }]);
    toast(`✦ ${p.name} added to bag`);
  }, [commit, toast]);

  const setQty = useCallback((id: string, qty: number) => {
    const cur = storedRef.current;
    if (!cur.some(l => l.id === id)) return;
    const q = Math.min(MAX_QTY, Math.floor(qty));
    commit(q < 1 ? cur.filter(l => l.id !== id) : cur.map(l => l.id === id ? { ...l, qty: q } : l));
  }, [commit]);

  const removeFromCart = useCallback((id: string) => commit(storedRef.current.filter(l => l.id !== id)), [commit]);
  const clearCart = useCallback(() => commit([]), [commit]);

  const cart = useMemo<CartLine[]>(
    () => stored.map(l => ({ product: productById.get(l.id)!, qty: l.qty })), // ids are validated by sanitizeCart/addToCart
    [stored]
  );
  const cartCount = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((n, l) => n + l.product.priceInr * l.qty, 0), [cart]);

  return (
    <C.Provider value={{
      wishlist, toggleWishlist,
      cart, cartCount, cartTotal, addToCart, setQty, removeFromCart, clearCart,
      cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
      toast, openLightbox: setLb,
    }}>
      {children}
      <div className={"lightbox" + (lb ? " open" : "")} onClick={e => e.target === e.currentTarget && setLb(null)}>
        <button className="close" onClick={() => setLb(null)}>✕</button>
        {lb && <img src={lb} alt="" />}
      </div>
      <div className={"toast" + (show ? " show" : "")}>{msg}</div>
    </C.Provider>
  );
}
