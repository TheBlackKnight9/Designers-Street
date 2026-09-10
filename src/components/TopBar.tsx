"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useEffect, useState } from "react";
import { SearchOverlay } from "./SearchOverlay";
import { ShoppingBag, Search, Heart, X } from "lucide-react";

export function TopBar() {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [badgesReady, setBadgesReady] = useState(false);
  const [promoOpen, setPromoOpen] = useState(true);

  useEffect(() => {
    setBadgesReady(true);
  }, []);

  return (
    <>
      <header
        suppressHydrationWarning
        className="fixed left-0 right-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--border-subtle)]"
      >
        {/* Editorial promo ticker — understated luxury */}
        {promoOpen && (
          <div className="bg-[var(--charcoal)] text-white text-[9px] font-medium uppercase tracking-[0.16em] py-1.5 px-4 flex items-center gap-2">
            <span className="flex-1 truncate text-center">
              Complimentary White-Glove Delivery · Bespoke Consultations
            </span>
            <button type="button" onClick={() => setPromoOpen(false)} aria-label="Close promo" className="opacity-50 hover:opacity-100 transition-opacity">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="h-[var(--top-bar-height)] flex items-center justify-between px-4 gap-3">
          {/* Brand monogram + wordmark */}
          <Link href="/" className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <span className="flex-shrink-0 w-8 h-8 rounded-md bg-[var(--charcoal)] flex items-center justify-center text-white text-[10px] font-semibold tracking-[0.1em]">
              DS
            </span>
            <span className="font-display text-[15px] font-semibold tracking-wide text-[var(--charcoal)] hidden sm:inline">
              Designer&apos;s Street
            </span>
          </Link>

          {/* Action icons — clean, spacious touch targets */}
          <div className="flex items-center gap-1 flex-shrink-0" suppressHydrationWarning>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="touch-target flex items-center justify-center p-2.5"
              aria-label="Search"
            >
              <Search className="w-[20px] h-[20px] text-[var(--charcoal)] stroke-[1.5]" />
            </button>

            <Link href="/wishlist" className="touch-target relative flex items-center justify-center p-2.5" aria-label="Wishlist">
              <Heart className="w-[20px] h-[20px] text-[var(--charcoal)] stroke-[1.5]" />
              {badgesReady && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[var(--charcoal)] text-white text-[9px] font-medium rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="touch-target relative flex items-center justify-center p-2.5" aria-label="Shopping Bag">
              <ShoppingBag className="w-[20px] h-[20px] text-[var(--charcoal)] stroke-[1.5]" />
              {badgesReady && itemCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[var(--charcoal)] text-white text-[9px] font-medium rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[var(--top-bar-height)]" />

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
