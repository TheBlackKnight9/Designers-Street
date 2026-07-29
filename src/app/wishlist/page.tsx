"use client";

import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { PRODUCTS } from "@/lib/mock-data";

export default function WishlistPage() {
  const { ids } = useWishlist();

  const wishedProducts = PRODUCTS.filter((p) => ids.includes(p.id));

  return (
    <>
      <TopBar />
      <main className="min-h-screen">
        <div className="px-4 pt-5 pb-4">
          <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
            Wishlist
          </h1>
          <p className="font-sans text-xs text-[#7A7A7A] mt-1">
            {wishedProducts.length} {wishedProducts.length === 1 ? "piece" : "pieces"} saved
          </p>
        </div>

        {wishedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 px-4 pb-8">
            {wishedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-20 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-[#E0E0E0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h2 className="font-sans text-sm font-semibold text-[#2B2B2B] mb-1">
              Your wishlist is empty
            </h2>
            <p className="font-sans text-xs text-[#7A7A7A]">
              Double-tap any piece to save it here.
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
