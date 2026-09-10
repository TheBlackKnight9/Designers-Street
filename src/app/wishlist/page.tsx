"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { PRODUCTS } from "@/lib/mock-data";
import { getProduct, isRemoteApiEnabled } from "@/lib/api/catalog";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const remote = isRemoteApiEnabled();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (!ids.length) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      if (!remote) {
        if (!cancelled) {
          setProducts(PRODUCTS.filter((p) => ids.includes(p.id)));
          setLoading(false);
        }
        return;
      }
      const resolved = await Promise.all(
        ids.map((id) => getProduct(id).catch(() => null))
      );
      if (!cancelled) {
        setProducts(resolved.filter((p): p is Product => Boolean(p)));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids, remote]);

  return (
    <>
      <TopBar />
      <main className="min-h-screen">
        <div className="px-4 pt-5 pb-4">
          <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
            Wishlist
          </h1>
          <p className="font-sans text-xs text-[#7A7A7A] mt-1">
            {loading
              ? "Loading…"
              : `${products.length} ${products.length === 1 ? "piece" : "pieces"} saved`}
          </p>
        </div>

        {loading ? (
          <p className="px-4 text-sm text-[#7A7A7A]">Loading saved pieces…</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 px-4 pb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-20 text-center max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#FF6B00] shadow-xs">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <h2 className="font-sans text-base font-bold text-[#1A1A1A] mb-1">
              Your wishlist is empty
            </h2>
            <p className="font-sans text-xs text-stone mb-6">
              Save couture pieces and designer drops you love to view or order anytime.
            </p>
            <Link
              href="/store"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all"
            >
              Explore Runway Catalog
            </Link>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
