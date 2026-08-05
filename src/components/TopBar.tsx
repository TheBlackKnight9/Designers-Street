"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { SearchOverlay } from "./SearchOverlay";
import { MapPin, ChevronDown, Store, ShoppingBag, Search, User, X } from "lucide-react";

type AddressPin = {
  postalCode: string;
  city: string;
  isDefault?: boolean;
};

export function TopBar() {
  const { itemCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [badgesReady, setBadgesReady] = useState(false);
  const [promoOpen, setPromoOpen] = useState(true);
  const [appBarOpen, setAppBarOpen] = useState(true);
  const [locationLabel, setLocationLabel] = useState("Add delivery address");

  useEffect(() => {
    setBadgesReady(true);
  }, []);

  useEffect(() => {
    fetch("/api/profile/addresses")
      .then((res) => res.json())
      .then((body) => {
        if (!body?.ok || !Array.isArray(body.data?.addresses) || body.data.addresses.length === 0) {
          setLocationLabel("Add delivery address");
          return;
        }
        const addresses = body.data.addresses as AddressPin[];
        const preferred =
          addresses.find((a) => a.isDefault) ?? addresses[0];
        setLocationLabel(`${preferred.postalCode}, ${preferred.city}`);
      })
      .catch(() => setLocationLabel("Add delivery address"));
  }, []);

  return (
    <>
      {appBarOpen && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-[var(--newme-pink)] text-paper px-3 py-2 flex items-center gap-2 text-[10px] font-bold">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-paper/20 flex items-center justify-center text-[8px]">
            DS
          </span>
          <p className="flex-1 leading-tight">
            FLAT 15% OFF ON FIRST ORDER
            <span className="block text-[9px] font-semibold opacity-90">★ 4.8 · Authentic designer pieces</span>
          </p>
          <Link
            href="/store"
            className="flex-shrink-0 px-3 py-1.5 bg-paper text-charcoal text-[9px] font-extrabold uppercase rounded-full"
          >
            Shop Now
          </Link>
          <button
            type="button"
            onClick={() => setAppBarOpen(false)}
            className="flex-shrink-0 p-1"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <header
        suppressHydrationWarning
        className={`fixed left-0 right-0 z-50 bg-paper border-b border-[var(--border-subtle)] ${
          appBarOpen ? "top-[52px]" : "top-0"
        }`}
      >
        {promoOpen && (
          <div className="bg-charcoal text-paper text-[9px] font-bold uppercase tracking-wide py-1.5 px-3 flex items-center gap-2">
            <Link href="/bespoke" className="flex-1 truncate animate-pulse hover:underline">
              ⚡ EXPRESS ATELIER DELIVERY · BESPOKE CONSULTATIONS AVAILABLE
            </Link>
            <button type="button" onClick={() => setPromoOpen(false)} aria-label="Close promo">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="h-[var(--top-bar-height)] flex items-center justify-between px-3 gap-2">
          <Link href="/" className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
            <span className="w-8 h-8 rounded-lg bg-[var(--newme-green)] flex items-center justify-center text-charcoal text-xs font-black">
              DS
            </span>
            <span className="font-sans text-sm font-black uppercase tracking-tight text-charcoal hidden sm:inline">
              Designer&apos;s Street
            </span>
          </Link>

          <Link
            href="/profile/addresses"
            className="flex-1 min-w-0 max-w-[200px] mx-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[var(--border-default)] bg-mist text-left active:scale-[0.98] transition-transform"
            aria-label="Manage delivery addresses"
          >
            <MapPin className="w-3.5 h-3.5 text-[var(--newme-green-dark)] flex-shrink-0" />
            <span className="text-[10px] font-semibold text-charcoal truncate">
              {locationLabel}
            </span>
            <ChevronDown className="w-3 h-3 text-stone flex-shrink-0" />
          </Link>

          <div className="flex items-center gap-0.5 flex-shrink-0" suppressHydrationWarning>
            <Link
              href="/designers"
              className="touch-target p-2"
              aria-label="Designer Houses"
              title="Browse Designer Houses"
            >
              <Store className="w-5 h-5 text-charcoal stroke-[1.8]" />
            </Link>

            <Link href="/cart" className="touch-target relative p-2" aria-label="Bag">
              <ShoppingBag className="w-5 h-5 text-charcoal stroke-[1.8]" />
              {badgesReady && itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-1 bg-[var(--newme-pink)] text-paper text-[8px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="touch-target p-2"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-charcoal stroke-[1.8]" />
            </button>

            <Link href="/profile" className="touch-target p-2" aria-label="Profile">
              <div className="w-7 h-7 rounded-full bg-mist border border-[var(--border-default)] flex items-center justify-center">
                <User className="w-4 h-4 text-charcoal stroke-[1.8]" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div
        className={
          appBarOpen
            ? promoOpen
              ? "h-[calc(52px+var(--top-bar-height)+28px)]"
              : "h-[calc(52px+var(--top-bar-height))]"
            : promoOpen
              ? "h-[calc(var(--top-bar-height)+28px)]"
              : "h-[var(--top-bar-height)]"
        }
      />

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
