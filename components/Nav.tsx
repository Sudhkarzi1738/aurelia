"use client";
import { useEffect, useState } from "react";
import { useStore } from "./Providers";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "./auth/AuthModal";
import type { User } from "@supabase/supabase-js";

const links: [string, string][] = [
  ["collections", "Collections"],
  ["necklaces", "Necklaces"],
  ["bracelets", "Bracelets"],
  ["rings", "Rings"],
  ["earrings", "Earrings"],
  ["bridal", "Bridal"],
];

export function Nav() {
  const { cartCount, wishlist, openCart, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    try {
      const supabase = createClient();
      async function syncUser(u: User | null) {
        if (!mounted) return;
        setUser(u);
        if (!u) {
          setIsAdmin(false);
          return;
        }
        try {
          const { data } = await supabase.from("profiles").select("role").eq("id", u.id).maybeSingle();
          if (mounted) setIsAdmin(data?.role === "admin");
        } catch {
          if (mounted) setIsAdmin(false);
        }
      }
      supabase.auth.getUser().then(({ data }) => syncUser(data.user));
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        syncUser(session?.user ?? null);
      });
      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch {
      return () => {
        mounted = false;
      };
    }
  }, []);

  async function signOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast("✦ Signed out");
    } catch {
      toast("Could not sign out");
    }
  }

  const label = user?.email?.split("@")[0] ?? null;

  return (
    <>
      <nav>
        <a href="/" className="logo">
          AURE<span>LIA</span>
        </a>
        <div className={"nav-links" + (open ? " open" : "")} id="navLinks">
          {links.map(([id, l]) => (
            <a key={id} href={`/#${id}`} onClick={() => setOpen(false)}>
              {l}
            </a>
          ))}
          {isAdmin && (
            <a href="/admin" onClick={() => setOpen(false)}>
              Admin
            </a>
          )}
        </div>
        <div className="nav-icons">
          <a
            className="cart-btn"
            href="/#search"
            aria-label="Search"
            onClick={() => window.dispatchEvent(new Event("aurelia:search"))}
          >
            🔍
          </a>
          <a className="cart-btn" href="/#collections" aria-label="Wishlist">
            ♡{wishlist.length > 0 && <span className="cart-count">{wishlist.length}</span>}
          </a>
          <button className="cart-btn" onClick={openCart} aria-label={`Open bag, ${cartCount} items`}>
            🛍{cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
          {user ? (
            <button
              className="cart-btn auth-btn"
              onClick={signOut}
              title={user.email ?? ""}
              aria-label="Sign out"
            >
              {label ? label.slice(0, 8) : "Account"}
            </button>
          ) : (
            <button className="cart-btn auth-btn" onClick={() => setAuthOpen(true)} aria-label="Sign in">
              Sign in
            </button>
          )}
          <div className="burger" id="burger" onClick={() => setOpen((o) => !o)}>
            ☰
          </div>
        </div>
      </nav>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
