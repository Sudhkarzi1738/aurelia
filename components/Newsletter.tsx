"use client";
import { useStore } from "./Providers";

export function Newsletter() {
  const { toast } = useStore();
  return (
    <section className="newsletter">
      <div className="sec-head" style={{ marginBottom: 0 }}>
        <div className="eyebrow">Private Viewings</div>
        <h2>Join the Aurelia Circle</h2>
        <p>First sight of new collections, private salon invitations, and concierge service.</p>
      </div>
      {/* TODO Phase 5: POST to /api/newsletter (Supabase). Currently UI-only, as in the original. */}
      <form onSubmit={e => { e.preventDefault(); toast("Welcome to the Aurelia Circle"); e.currentTarget.reset(); }}>
        <input type="email" placeholder="Your email address" required />
        <button className="btn btn-solid" type="submit">Subscribe</button>
      </form>
    </section>
  );
}
