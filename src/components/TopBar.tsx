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
        const preferred = addresses.find((a) => a.isDefault) ?? addresses[0];
        setLocationLabel(`${preferred.postalCode}, ${preferred.city}`);
      })
      .catch(() => setLocationLabel("Add delivery address"));
  }, []);

  return (
    <>
      <header
        suppressHydrationWarning
        className="fixed left-0 right-0 top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-[var(--border-subtle)]"
      >
        {promoOpen && (
          <div className="bg-charcoal text-paper text-[9px] font-bold uppercase tracking-wide py-1.5 px-3 flex items-center gap-2">
            <Link href="/bespoke" className="flex-1 truncate animate-pulse hover:underline">
              ⚡ EXPRESS ATELIER DELIVERY · BESPOKE CONSULTATIONS AVAILABLE
            </Link>
            <button type="button" onClick={() => setPromoOpen(false)} aria-label="Close promo">
              <X className="w-3 h-3 text-paper" />
            </button>
          </div>
        )}

        <div className="h-[var(--top-bar-height)] flex items-center justify-between px-3 gap-2">
          <Link href="/" className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
            <span className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center text-paper text-[10px] font-black tracking-wider">
              DS
            </span>
            <span className="font-sans text-sm font-black uppercase tracking-tight text-charcoal hidden sm:inline">
              Designer&apos;s Street
            </span>
          </Link>

          <Link
            href="/profile/addresses"
            className="flex-1 min-w-0 max-w-[200px] mx-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border-[1.5px] border-charcoal/20 bg-mist text-left shadow-[0_1px_3px_rgba(42,31,24,0.1)] active:scale-[0.98] transition-transform"
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
                <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-1 bg-charcoal text-paper text-[8px] font-bold rounded-full flex items-center justify-center">
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

      <div className="h-[var(--top-bar-height)]" />

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
