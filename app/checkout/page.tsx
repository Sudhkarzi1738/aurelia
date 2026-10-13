"use client";

import { useState } from "react";
import Link from "next/link";
import { inr } from "@/lib/products";
import { MAX_QTY, useStore } from "@/components/Providers";

export default function CheckoutPage() {
  const { cart, cartCount, cartTotal, setQty, removeFromCart, clearCart, toast } = useStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (cart.length === 0 || busy) return;
    if (!email.trim() || !email.includes("@")) {
      toast("Please enter a valid email");
      return;
    }
    setBusy(true);
    try {
      const lines = cart.map(({ product, qty }) => ({ id: product.id, qty }));
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          guestEmail: email.trim(),
          shipping: {
            name: name.trim() || undefined,
            phone: phone.trim() || undefined,
            line1: line1.trim() || undefined,
            line2: line2.trim() || undefined,
            city: city.trim() || undefined,
            state: state.trim() || undefined,
            postal: postal.trim() || undefined,
            country: "IN",
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error ?? "Checkout failed");
        return;
      }

      if (data.razorpayOrderId && data.keyId) {
        await loadRazorpay();
        type RzpHandler = {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        };
        const Razorpay = (
          window as unknown as { Razorpay: new (opts: object) => { open: () => void } }
        ).Razorpay;
        const orderId = data.orderId as string;
        const rzp = new Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency ?? "INR",
          name: "Aurelia",
          description: `Order ${orderId}`,
          order_id: data.razorpayOrderId,
          prefill: {
            email: email.trim(),
            name: name.trim() || undefined,
            contact: phone.trim() || undefined,
          },
          handler: async (response: RzpHandler) => {
            try {
              const vRes = await fetch("/api/checkout/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const vData = await vRes.json().catch(() => ({}));
              toast(vRes.ok && vData.ok ? "✦ Payment confirmed — thank you" : "Payment received; confirmation pending");
              clearCart();
              window.location.href = "/?paid=1";
            } catch {
              toast("Payment received; confirmation pending");
              clearCart();
            }
          },
          theme: { color: "#1a1a1a" },
        });
        rzp.open();
      } else {
        toast(
          `✦ Order ${String(data.orderId).slice(0, 8)}… — ${inr(data.totalInr ?? cartTotal)} (server-priced)`
        );
      }
    } catch {
      toast("Network error — please try again");
    } finally {
      setBusy(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h1 className="serif">Your bag is empty</h1>
          <p>Add a piece from the collections to begin checkout.</p>
          <Link className="btn btn-solid" href="/#collections">
            Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="serif checkout-title">Checkout</h1>
      <p className="checkout-sub">
        {cartCount} item{cartCount === 1 ? "" : "s"} · Prices confirmed server-side at payment
      </p>

      <div className="checkout-grid">
        <div className="checkout-form-col">
          <h2 className="serif">Contact &amp; delivery</h2>
          <div className="checkout-form">
            <label>
              Email *
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <label>
              Full name
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label>
              Phone
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            </label>
            <label className="full">
              Address line 1
              <input type="text" value={line1} onChange={(e) => setLine1(e.target.value)} autoComplete="address-line1" />
            </label>
            <label className="full">
              Address line 2
              <input type="text" value={line2} onChange={(e) => setLine2(e.target.value)} autoComplete="address-line2" />
            </label>
            <label>
              City
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
            </label>
            <label>
              State
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} autoComplete="address-level1" />
            </label>
            <label>
              PIN code
              <input type="text" value={postal} onChange={(e) => setPostal(e.target.value)} autoComplete="postal-code" />
            </label>
          </div>
        </div>

        <div className="checkout-summary">
          <h2 className="serif">Order summary</h2>
          <ul className="checkout-lines">
            {cart.map(({ product: p, qty }) => (
              <li key={p.id}>
                <Link href={`/product/${p.id}`} className="co-img">
                  <img src={p.image} alt="" />
                </Link>
                <div className="co-body">
                  <Link href={`/product/${p.id}`} className="co-name">
                    {p.name}
                  </Link>
                  <div className="co-sku">{p.sku}</div>
                  <div className="co-row">
                    <div className="qty">
                      <button type="button" onClick={() => setQty(p.id, qty - 1)} aria-label="Decrease">
                        −
                      </button>
                      <span>{qty}</span>
                      <button type="button" onClick={() => setQty(p.id, qty + 1)} disabled={qty >= MAX_QTY} aria-label="Increase">
                        +
                      </button>
                    </div>
                    <b>{inr(p.priceInr * qty)}</b>
                  </div>
                </div>
                <button type="button" className="line-remove" onClick={() => removeFromCart(p.id)} aria-label="Remove">
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="co-totals">
            <div>
              <span>Subtotal</span>
              <b>{inr(cartTotal)}</b>
            </div>
            <div>
              <span>Shipping</span>
              <b>Complimentary</b>
            </div>
            <div className="co-grand">
              <span>Total</span>
              <b>{inr(cartTotal)}</b>
            </div>
          </div>
          <button className="btn btn-solid co-pay" type="button" disabled={busy} onClick={pay}>
            {busy ? "Securing prices…" : "Pay securely"}
          </button>
          <p className="co-secure">Encrypted checkout · Razorpay · Cards, UPI, netbanking</p>
        </div>
      </div>
    </div>
  );
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject();
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Razorpay script failed"));
    document.body.appendChild(s);
  });
}
