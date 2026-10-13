import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { CartDrawer } from "@/components/CartDrawer";

export const metadata: Metadata = { title: "AURELIA — Fine Luxury Jewellery" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <div className="announce">Complimentary insured shipping worldwide &nbsp;✦&nbsp; Lifetime craftsmanship warranty</div>
          <Nav />
          <CartDrawer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
