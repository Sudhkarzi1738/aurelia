"use client";
import { useEffect, useRef, useState } from "react";
import { inr } from "@/lib/products";
import { MAX_QTY, useStore } from "./Providers";

export function CartDrawer() {
  const {
    cart,
    cartCount,
    cartTotal,
    cartOpen,
    closeCart,
    setQty,
    removeFromCart,
    clearCart,
    toast,
  } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    if (cartOpen) closeRef.current?.focus();
  }, [cartOpen]);

  async function proceedToCheckout() {
    if (cart.length === 0 || checkingOut) return;
    setCheckingOut(true);
    try {
      const lines = cart.map(({ product, qty }) => ({ id: product.id, qty }));

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          guestEmail: guestEmail.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast(data.error ?? "Checkout failed");
        return;
      }

      if (typeof data.totalInr === "number" && data.totalInr !== cartTotal) {
        toast(`✦ Total confirmed: ${inr(data.totalInr)}`);
      }

      if (data.razorpayOrderId && data.keyId && typeof window !== "undefined") {
        await loadRazorpay();
        type RzpHandler = {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        };
        const Razorpay = (
          window as unknown as {
            Razorpay: new (opts: object) => { open: () => void };
          }
        ).Razorpay;
        const orderId = data.orderId as string;
        const rzp = new Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency ?? "INR",
          name: "Aurelia",
          description: `Order ${orderId}`,
          order_id: data.razorpayOrderId,
          prefill: guestEmail.trim() ? { email: guestEmail.trim() } : undefined,
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
              if (vRes.ok && vData.ok) {
                toast("✦ Payment confirmed — thank you");
                clearCart();
                closeCart();
              } else {
                toast(vData.error ?? "Payment received; confirmation pending");
                clearCart();
                closeCart();
              }
            } catch {
              toast("Payment received; confirmation pending");
              clearCart();
              closeCart();
            }
          },
          modal: {
            ondismiss: () => {
              toast("Checkout cancelled");
            },
          },
          theme: { color: "#1a1a1a" },
        });
        rzp.open();
      } else {
        toast(
          data.message
            ? `✦ Order ${String(data.orderId).slice(0, 8)}… — ${inr(data.totalInr ?? cartTotal)} (server-priced)`
            : `✦ Order created — ${inr(data.totalInr ?? cartTotal)}`
        );
      }
    } catch {
      toast("Network error — please try again");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <>
      <div className={"drawer-scrim" + (cartOpen ? " open" : "")} onClick={closeCart} />
      <aside
        className={"drawer" + (cartOpen ? " open" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        inert={!cartOpen}
      >
        <div className="drawer-head">
          <h3>
            Your Bag{cartCount > 0 && <span> · {cartCount}</span>}
          </h3>
          <button ref={closeRef} className="drawer-close" onClick={closeCart} aria-label="Close bag">
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="drawer-empty">
            <p className="serif">Your bag is empty</p>
            <small>Pieces you add will wait for you here.</small>
            <a className="btn" href="/#collections" onClick={closeCart}>
              Explore Collections
            </a>
          </div>
        ) : (
          <>
            <ul className="drawer-lines">
              {cart.map(({ product: p, qty }) => (
                <li key={p.id} className="line">
                  <div className="line-img">
                    <img src={p.image} alt={p.name} />
                  </div>
                  <div className="line-body">
                    <div className="line-name">{p.name}</div>
                    <div className="line-sku">{p.sku}</div>
                    <div className="line-row">
                      <div className="qty" role="group" aria-label={`Quantity for ${p.name}`}>
                        <button onClick={() => setQty(p.id, qty - 1)} aria-label="Decrease quantity">
                          −
                        </button>
                        <span aria-live="polite">{qty}</span>
                        <button
                          onClick={() => setQty(p.id, qty + 1)}
                          disabled={qty >= MAX_QTY}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <b className="line-total">{inr(p.priceInr * qty)}</b>
                    </div>
                    {qty > 1 && <div className="line-each">{inr(p.priceInr)} each</div>}
                  </div>
                  <button
                    className="line-remove"
                    onClick={() => removeFromCart(p.id)}
                    aria-label={`Remove ${p.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <div className="sub-row">
                <span>Subtotal</span>
                <b>{inr(cartTotal)}</b>
              </div>
              <small>Inclusive of taxes · Complimentary insured shipping</small>
              <label className="guest-email">
                <span>Email for order confirmation</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <button className="btn btn-solid" onClick={proceedToCheckout} disabled={checkingOut}>
                {checkingOut ? "Securing prices…" : "Pay now"}
              </button>
              <a className="btn" href="/checkout" onClick={closeCart}>
                Full checkout
              </a>
              <button className="link-btn" onClick={clearCart}>
                Empty bag
              </button>
            </div>
          </>
        )}
      </aside>
    </>
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
