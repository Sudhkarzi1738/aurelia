"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "./Providers";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "./auth/AuthModal";
import { products, inr, displayProductName } from "@/lib/products";
import type { User } from "@supabase/supabase-js";

const links: [string, string][] = [
  ["collections", "Collections"],
  ["shop-by", "Categories"],
  ["necklaces", "High Jewellery"],
];

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function IconHeart({ filled }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s-6.5-4.35-9.33-7.18C.9 12.05.5 9.5 2.1 7.6 3.5 5.9 5.9 5.5 7.7 6.7c1 .7 1.7 1.6 2.3 2.5.6-.9 1.3-1.8 2.3-2.5 1.8-1.2 4.2-.8 5.6.9 1.6 1.9 1.2 4.45-.57 6.22C18.5 16.65 12 21 12 21z" strokeLinejoin="round" />
    </svg>
  );
}
function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 8h15l-1.5 9h-12L6 8z" strokeLinejoin="round" />
      <path d="M6 8L5 4H2" strokeLinecap="round" />
      <circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" strokeLinejoin="round" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function Nav() {
  const { cartCount, wishlist, toggleWishlist, openCart, toast } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchHits = useMemo(() => {
    const t = searchQ.toLowerCase().trim();
    if (!t) return [];
    return products.filter((p) => `${p.name} ${p.sku} ${p.tag}`.toLowerCase().includes(t)).slice(0, 8);
  }, [searchQ]);

  const wishItems = useMemo(
    () => products.filter((p) => wishlist.includes(p.id)),
    [wishlist]
  );

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
      } = supabase.auth.onAuthStateChange((_e, session) => syncUser(session?.user ?? null));
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setWishOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen || wishOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen, wishOpen]);

  async function signOut() {
    try {
      await createClient().auth.signOut();
      toast("✦ Signed out");
    } catch {
      toast("Could not sign out");
    }
  }

  const label = user?.email?.split("@")[0] ?? null;

  return (
    <>
      <nav className={scrolled ? "nav-shrink" : ""}>
        <a href="/" className="logo">
          AURE<span>LIA</span>
        </a>
        <div className="nav-links-desktop">
          {links.map(([id, l]) => (
            <a key={id} href={`/#${id}`}>
              {l}
            </a>
          ))}
          {isAdmin && <a href="/admin">Admin</a>}
        </div>
        <div className="nav-icons">
          <button type="button" className="cart-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <IconSearch />
          </button>
          <button
            type="button"
            className="cart-btn"
            aria-label={`Wishlist, ${wishlist.length} items`}
            onClick={() => setWishOpen(true)}
          >
            <IconHeart filled={wishlist.length > 0} />
            {wishlist.length > 0 && <span className="cart-count">{wishlist.length}</span>}
          </button>
          <button type="button" className="cart-btn" aria-label={`Open bag, ${cartCount} items`} onClick={openCart}>
            <IconBag />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
          {user ? (
            <button type="button" className="cart-btn auth-btn" onClick={signOut} title={user.email ?? ""} aria-label="Sign out">
              {label ? label.slice(0, 8) : "Account"}
            </button>
          ) : (
            <button type="button" className="cart-btn auth-btn" onClick={() => setAuthOpen(true)} aria-label="Sign in">
              Sign in
            </button>
          )}
          <button type="button" className="burger" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <IconMenu />
          </button>
        </div>
      </nav>

      {/* Full-screen mobile menu */}
      <div className={"mobile-menu" + (menuOpen ? " open" : "")} role="dialog" aria-modal="true" aria-label="Menu">
        <div className="mobile-menu-top">
          <span className="logo">
            AURE<span>LIA</span>
          </span>
          <button type="button" className="cart-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <IconClose />
          </button>
        </div>
        <div className="mobile-menu-search">
          <label htmlFor="menu-search" className="sr-only">
            Search
          </label>
          <input
            id="menu-search"
            type="search"
            placeholder="Search collections…"
            onFocus={() => {
              setMenuOpen(false);
              setSearchOpen(true);
            }}
          />
        </div>
        <nav className="mobile-menu-links">
          {links.map(([id, l]) => (
            <a key={id} href={`/#${id}`} onClick={() => setMenuOpen(false)}>
              {l}
            </a>
          ))}
          <a href="/our-story" onClick={() => setMenuOpen(false)}>
            Our Story
          </a>
          <a href="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
          {isAdmin && (
            <a href="/admin" onClick={() => setMenuOpen(false)}>
              Admin
            </a>
          )}
          {!user && (
            <button
              type="button"
              className="btn btn-solid"
              onClick={() => {
                setMenuOpen(false);
                setAuthOpen(true);
              }}
            >
              Sign in
            </button>
          )}
        </nav>
      </div>

      {/* Search overlay */}
      <div className={"search-overlay" + (searchOpen ? " open" : "")} role="dialog" aria-modal="true" aria-label="Search">
        <div className="search-overlay-inner">
          <div className="search-overlay-bar">
            <label htmlFor="live-search" className="sr-only">
              Search products
            </label>
            <input
              id="live-search"
              type="search"
              autoFocus={searchOpen}
              placeholder="Search pieces…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
            <button type="button" className="cart-btn" aria-label="Close search" onClick={() => setSearchOpen(false)}>
              <IconClose />
            </button>
          </div>
          <ul className="search-hits">
            {searchHits.map((p) => (
              <li key={p.id}>
                <Link href={`/product/${p.id}`} onClick={() => setSearchOpen(false)}>
                  <img src={p.image} alt="" width={48} height={60} />
                  <span>
                    <strong>{displayProductName(p.name, 40)}</strong>
                    <small>{inr(p.priceInr)}</small>
                  </span>
                </Link>
              </li>
            ))}
            {searchQ && searchHits.length === 0 && <li className="search-empty">No pieces match “{searchQ}”</li>}
          </ul>
        </div>
      </div>

      {/* Wishlist drawer */}
      <div className={"drawer-scrim" + (wishOpen ? " open" : "")} onClick={() => setWishOpen(false)} />
      <aside className={"drawer wish-drawer" + (wishOpen ? " open" : "")} role="dialog" aria-modal="true" aria-label="Wishlist">
        <div className="drawer-head">
          <h3 className="serif">Wishlist{wishlist.length > 0 && <span> · {wishlist.length}</span>}</h3>
          <button type="button" className="drawer-close" aria-label="Close" onClick={() => setWishOpen(false)}>
            ✕
          </button>
        </div>
        {wishItems.length === 0 ? (
          <div className="drawer-empty">
            <p className="serif">Your wishlist is empty</p>
            <small>Tap the heart on any piece to save it here.</small>
          </div>
        ) : (
          <ul className="drawer-lines">
            {wishItems.map((p) => (
              <li key={p.id} className="line">
                <div className="line-img">
                  <img src={p.image} alt={p.name} />
                </div>
                <div className="line-body">
                  <Link href={`/product/${p.id}`} className="line-name" onClick={() => setWishOpen(false)}>
                    {p.name}
                  </Link>
                  <div className="line-total">{inr(p.priceInr)}</div>
                </div>
                <button type="button" className="line-remove" aria-label={`Remove ${p.name}`} onClick={() => toggleWishlist(p.id, p.name)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Mobile bottom bar */}
      <nav className="bottom-bar" aria-label="Mobile primary">
        <a href="/" className="bottom-item">
          <IconHome />
          <span>Home</span>
        </a>
        <a href="/#collections" className="bottom-item">
          <IconSearch />
          <span>Shop</span>
        </a>
        <button type="button" className="bottom-item" onClick={() => setWishOpen(true)}>
          <IconHeart filled={wishlist.length > 0} />
          <span>Wishlist</span>
          {wishlist.length > 0 && <i className="bottom-badge">{wishlist.length}</i>}
        </button>
        <button type="button" className="bottom-item" onClick={openCart}>
          <IconBag />
          <span>Bag</span>
          {cartCount > 0 && <i className="bottom-badge">{cartCount}</i>}
        </button>
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
