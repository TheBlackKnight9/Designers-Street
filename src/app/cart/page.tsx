"use client";

import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/mock-data";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";

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
      <main className="min-h-screen pb-28">
        <div className="px-4 pt-5 pb-4">
          <h1 className="font-display text-2xl font-semibold text-[var(--charcoal)] tracking-wide">
            Your Bag
          </h1>
          <p className="font-sans text-xs text-[var(--stone)] mt-1">
            {itemCount} {itemCount === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {/* Free Shipping Banner */}
        {items.length > 0 && (
          <div className="mx-4 mb-4 p-3 bg-[var(--mist)] border border-[var(--border-default)] rounded-lg flex items-center justify-between text-xs text-[var(--charcoal)]">
            <span className="font-medium">Complimentary express shipping applied</span>
            <span className="px-2 py-0.5 bg-[var(--charcoal)] text-white text-[9px] font-medium uppercase tracking-wider rounded">
              Free
            </span>
          </div>
        )}

        {items.length > 0 ? (
          <>
            <div className="px-4 space-y-4 pb-6">
              {Object.entries(groupedItems).map(([brand, brandItems]) => (
                <div key={brand} className="space-y-3 bg-white p-4 rounded-xl border border-[var(--border-default)]">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                    <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[var(--charcoal)]">{brand}</h2>
                    <span className="text-[9px] font-medium text-[var(--stone)] uppercase tracking-wider">Direct Fulfillment</span>
                  </div>

                  <div className="space-y-3">
                    {brandItems.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="flex gap-4 p-3 bg-[var(--mist)] rounded-lg"
                      >
                        {/* Image */}
                        <Link
                          href={`/product/${item.productId}`}
                          className="relative w-20 h-24 rounded-lg overflow-hidden bg-[var(--border-default)] flex-shrink-0"
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
                          <p className="font-sans text-[10px] font-medium uppercase tracking-widest text-[var(--stone)]">
                            {item.brand}
                          </p>
                          <p className="font-sans text-sm font-medium text-[var(--charcoal)] truncate mt-0.5">
                            {item.name}
                          </p>
                          <p className="font-sans text-xs text-[var(--stone)] mt-0.5">
                            Size: {item.size}
                          </p>
                          <p className="font-mono text-sm font-semibold text-[var(--charcoal)] mt-1">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity + Remove */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center border border-[var(--border-default)] rounded-md text-[var(--charcoal)] hover:bg-[var(--border-subtle)] transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-sans text-xs font-semibold text-[var(--charcoal)] w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center border border-[var(--border-default)] rounded-md text-[var(--charcoal)] hover:bg-[var(--border-subtle)] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId, item.size)}
                              className="flex items-center gap-1 font-sans text-[10px] font-medium uppercase tracking-wider text-[var(--stone)] hover:text-[var(--accent-hot)] transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
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
            <div className="mx-4 p-4 bg-[var(--mist)] rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--stone)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <div>
                  <p className="font-sans text-xs font-semibold text-[var(--charcoal)]">White-Glove Packaging</p>
                  <p className="font-sans text-xs text-[var(--stone)] mt-0.5">
                    Each piece is hand-wrapped in archival tissue and housed in a branded keepsake box.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary + CTA */}
            <div className="px-4 pb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-sm font-medium text-[var(--charcoal)] uppercase tracking-wider">
                  Subtotal
                </span>
                <span className="font-mono text-base font-semibold text-[var(--charcoal)]">
                  {formatPrice(total)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="flex items-center justify-center w-full h-12 bg-[var(--charcoal)] text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-lg btn-press mb-3"
              >
                Proceed to Checkout
              </Link>
              <div className="text-center">
                <span className="font-sans text-xs text-[var(--stone)]">
                  Need help? <Link href="/bespoke" className="font-medium text-[var(--charcoal)] underline underline-offset-2">Speak to a stylist</Link>
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Luxurious empty cart state */
          <div className="px-4 py-16 text-center">
            <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-[var(--mist)] flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-[var(--stone)] stroke-[1.2]" />
            </div>
            <h2 className="font-display text-lg font-semibold text-[var(--charcoal)] mb-2">
              Your shopping bag is empty
            </h2>
            <p className="font-sans text-sm text-[var(--stone)] mb-6 max-w-xs mx-auto leading-relaxed">
              Discover exclusive collections from our designer houses and add pieces to your bag.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link
                href="/store"
                className="flex items-center justify-center h-12 bg-[var(--charcoal)] text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-lg btn-press"
              >
                Browse Collections
              </Link>
              <Link
                href="/designers"
                className="flex items-center justify-center h-12 border border-[var(--charcoal)] text-[var(--charcoal)] font-sans text-xs font-semibold uppercase tracking-wider rounded-lg btn-press"
              >
                Explore Designer Houses
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
