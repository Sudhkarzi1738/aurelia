import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { CartDrawer } from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "AURELIA — Fine Luxury Jewellery",
  description: "Hand-finished heirlooms in gold, kundan, diamonds and pearls.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e0d0b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="image" href="/assets/necklace-kundan.webp" />
      </head>
      <body>
        <Providers>
          <div className="announce">
            Complimentary insured shipping worldwide &nbsp;✦&nbsp; Lifetime craftsmanship warranty
          </div>
          <Nav />
          <CartDrawer />
          <main id="main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
