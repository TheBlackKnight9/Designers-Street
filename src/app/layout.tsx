import type { Metadata, Viewport } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { MediaViewerProvider } from "@/context/MediaViewerContext";
import { ToastProvider } from "@/components/dashboard/Toast";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

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
  themeColor: "#E8DFD3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className={`min-h-full flex flex-col bg-paper text-charcoal pb-24 font-sans ${geistSans.className}`} suppressHydrationWarning>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <MediaViewerProvider>
                {children}
                <BottomNav />
              </MediaViewerProvider>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
