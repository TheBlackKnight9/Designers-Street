import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { DataProvider } from "@/context/DataContext";
import { MediaViewerProvider } from "@/context/MediaViewerContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Designer's Street — Exclusive Designer Collections",
  description:
    "Discover exclusive, limited-edition collections from India's most celebrated designer houses. Couture-adjacent ready-to-wear, bridal, and bespoke — curated for the discerning buyer.",
  keywords: [
    "designer fashion",
    "luxury collections",
    "bridal couture",
    "designer lehengas",
    "exclusive fashion",
    "bespoke clothing",
    "Indian designer wear",
  ],
  openGraph: {
    title: "Designer's Street — Exclusive Designer Collections",
    description:
      "Limited-edition collections from India's most celebrated designer houses. Bridal, couture, and bespoke.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAFAFA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-charcoal">
        <DataProvider>
          <CartProvider>
            <WishlistProvider>
              <MediaViewerProvider>{children}</MediaViewerProvider>
            </WishlistProvider>
          </CartProvider>
        </DataProvider>
      </body>
    </html>
  );
}
