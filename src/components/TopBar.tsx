"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useEffect, useState } from "react";
import { SearchOverlay } from "./SearchOverlay";

export function TopBar() {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  // Avoid SSR/client badge mismatch after localStorage/API hydrate
  const [badgesReady, setBadgesReady] = useState(false);
  useEffect(() => {
    setBadgesReady(true);
  }, []);

  return (
    <>
      <header suppressHydrationWarning className="fixed top-0 left-0 right-0 z-50 h-[var(--top-bar-height)] flex items-center justify-between px-4 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-white/40 shadow-xs">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-display text-lg font-bold tracking-tight text-[#2B2B2B]">
            Designer&apos;s Street
          </span>
        </Link>

        <div className="flex items-center gap-2" suppressHydrationWarning>
          <Link
            href="/search"
            suppressHydrationWarning
            className="touch-target flex items-center justify-center p-2 rounded-full active:scale-95 transition-transform"
            aria-label="Search"
            title="Search Store Catalog"
          >
            <svg className="w-5 h-5 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </Link>

          <Link
            href="/designers"
            className="touch-target flex items-center justify-center p-2 rounded-full active:scale-95 transition-transform"
            aria-label="Designer Houses"
            title="Designer Houses Directory"
          >
            <svg className="w-5 h-5 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25a.75.75 0 01-.75-.75V10.5a.75.75 0 01.225-.53l7.5-7.5a.75.75 0 011.05 0l7.5 7.5a.75.75 0 01.225.53v9.75a.75.75 0 01-.75.75H13.5z" />
            </svg>
          </Link>

          <Link
            href="/wishlist"
            className="touch-target flex items-center justify-center relative p-2 rounded-full active:scale-95 transition-transform"
            aria-label="Wishlist"
          >
            <svg className="w-5 h-5 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {badgesReady && wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#2B2B2B] text-[#FAFAFA] text-[8px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="touch-target flex items-center justify-center relative p-2 rounded-full active:scale-95 transition-transform"
            aria-label="Shopping bag"
          >
            <svg className="w-5 h-5 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {badgesReady && itemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#2B2B2B] text-[#FAFAFA] text-[8px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="h-[var(--top-bar-height)]" />

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
