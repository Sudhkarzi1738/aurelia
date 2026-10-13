import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="foot-grid">
        <div>
          <Link href="/" className="logo" style={{ fontSize: "1.4rem" }}>
            AURE<span>LIA</span>
          </Link>
          <p style={{ marginTop: "1.2rem" }}>
            Maison de haute joaillerie crafting heirlooms in 22K gold, kundan, diamonds and pearls since
            1987. Jaipur · Mumbai · Paris.
          </p>
        </div>
        <div>
          <h4>Collections</h4>
          <Link href="/#necklaces">Necklaces</Link>
          <Link href="/#bracelets">Bracelets</Link>
          <Link href="/#rings">Rings</Link>
          <Link href="/#earrings">Earrings</Link>
          <Link href="/#bridal">Bridal</Link>
        </div>
        <div>
          <h4>Maison</h4>
          <Link href="/our-story">Our Story</Link>
          <Link href="/artisans">Artisans</Link>
          <Link href="/ateliers">Ateliers</Link>
          <Link href="/journal">Journal</Link>
        </div>
        <div>
          <h4>Concierge</h4>
          <Link href="/book-viewing">Book a Viewing</Link>
          <Link href="/ring-sizing">Ring Sizing</Link>
          <Link href="/care">Care &amp; Repair</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© 2026 Aurelia Haute Joaillerie. All rights reserved.</span>
        <span>Instagram · Pinterest · WhatsApp Concierge</span>
      </div>
    </footer>
  );
}
