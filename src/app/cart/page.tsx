"use client";

import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/mock-data";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();

  // Group cart items by Designer House
  const groupedItems: Record<string, typeof items> = {};
  items.forEach((item) => {
    const brand = item.brand || "Atelier House";
    if (!groupedItems[brand]) groupedItems[brand] = [];
    groupedItems[brand].push(item);
  });

  return (
    <>
      <TopBar />
      <main className="min-h-screen">
        <div className="px-4 pt-5 pb-4">
          <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
            Your Bag
          </h1>
          <p className="font-sans text-xs text-[#7A7A7A] mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Free Shipping Banner Highlight */}
        {items.length > 0 && (
          <div className="mx-4 mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-semibold shadow-2xs">
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span>COMPLIMENTARY EXPRESS SHIPPING APPLIED</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-700 text-white text-[9px] font-extrabold uppercase rounded">
              FREE SHIPPING
            </span>
          </div>
        )}

        {items.length > 0 ? (
          <>
            <div className="px-4 space-y-6 pb-6">
              {Object.entries(groupedItems).map(([brand, brandItems]) => (
                <div key={brand} className="space-y-3 bg-white p-4 rounded-2xl border border-cloud shadow-xs">
                  <div className="flex items-center justify-between border-b border-cloud pb-2">
                    <h2 className="font-display text-xs font-bold uppercase tracking-wider text-charcoal">{brand}</h2>
                    <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider">✓ Direct House Fulfillment</span>
                  </div>

                  <div className="space-y-3">
                    {brandItems.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="flex gap-4 p-3 bg-[#F9F9F8] rounded-xl border border-cloud/50"
                      >
                        {/* Image */}
                        <Link
                          href={`/product/${item.productId}`}
                          className="relative w-20 h-24 rounded-lg overflow-hidden bg-[#E0E0E0] flex-shrink-0"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-[#A0A0A0]">
                            {item.brand}
                          </p>
                          <p className="font-sans text-sm font-medium text-[#2B2B2B] truncate mt-0.5">
                            {item.name}
                          </p>
                          <p className="font-sans text-xs text-[#7A7A7A] mt-0.5">
                            Size: {item.size}
                          </p>
                          <p className="font-sans text-sm font-semibold text-[#2B2B2B] mt-1">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity + Remove */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center border border-[#E0E0E0] rounded-full text-xs font-bold text-[#2B2B2B]"
                              >
                                −
                              </button>
                              <span className="font-sans text-xs font-semibold text-[#2B2B2B] w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center border border-[#E0E0E0] rounded-full text-xs font-bold text-[#2B2B2B]"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId, item.size)}
                              className="font-sans text-[10px] font-semibold uppercase tracking-wider text-[#7A7A7A] underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Packaging note */}
            <div className="mx-4 p-4 bg-[#F0F0F0] rounded-xl mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#4A4A4A] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <div>
                  <p className="font-sans text-xs font-semibold text-[#2B2B2B]">White-Glove Packaging</p>
                  <p className="font-sans text-xs text-[#7A7A7A] mt-0.5">
                    Each piece is hand-wrapped in archival tissue and housed in a branded keepsake box.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary + CTA */}
            <div className="px-4 pb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-sm font-semibold text-[#2B2B2B] uppercase tracking-wide">
                  Subtotal
                </span>
                <span className="font-sans text-base font-bold text-[#2B2B2B]">
                  {formatPrice(total)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="flex items-center justify-center w-full h-12 bg-[#2B2B2B] text-[#FAFAFA] font-sans text-xs font-semibold uppercase tracking-wider rounded-full btn-press mb-3"
              >
                Proceed to Checkout
              </Link>
              <div className="text-center">
                <span className="font-sans text-xs text-[#7A7A7A]">
                  Need help? <span className="font-semibold text-[#2B2B2B] underline">Speak to a stylist</span>
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="px-4 py-20 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-[#E0E0E0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="font-sans text-sm font-semibold text-[#2B2B2B] mb-1">
              Your bag is empty
            </h2>
            <p className="font-sans text-xs text-[#7A7A7A] mb-4">
              Discover exclusive collections from our designer houses.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#2B2B2B] text-[#FAFAFA] font-sans text-xs font-semibold uppercase tracking-wider rounded-full btn-press"
            >
              Explore
            </Link>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
