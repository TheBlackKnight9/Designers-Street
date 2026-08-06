"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useOpenMediaViewer } from "@/context/MediaViewerContext";
import type { Product } from "@/lib/types";
import { productToViewerMedia } from "@/lib/media";
import { formatPrice } from "@/lib/mock-data";

interface ProductCardProps {
  product: Product;
  className?: string;
  id?: string;
}

function isValidImageUrl(url?: string | null): boolean {
  if (!url || url === "na" || url.trim() === "") return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

export function ProductCard({ product, className = "", id }: ProductCardProps) {
  const { isWished, toggle } = useWishlist();
  const { addItem } = useCart();
  const { openMediaViewer } = useOpenMediaViewer();
  const wished = isWished(product.id);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  const handleDoubleTap = useCallback(() => {
    if (!wished) toggle(product.id);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  }, [product.id, toggle, wished]);

  const handleImageTap = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.preventDefault();
      handleDoubleTap();
    }
    lastTapRef.current = now;
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.designerName,
      price: product.price,
      size: product.sizes[0] || "M",
      image: product.images[0],
    });
  };

  const coverImg = product.images[0];

  return (
    <div
      id={id}
      className={`product-card relative flex flex-col ${className}`}
    >
      {/* Image-first card — bold fashion grid */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-mist rounded-lg">
        <Link href={`/product/${product.id}`} className="absolute inset-0 block">
          <div onClick={handleImageTap} className="w-full h-full relative">
            {isValidImageUrl(coverImg) ? (
              <Image
                src={coverImg}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-stone bg-mist">
                {product.name.slice(0, 15)}
              </div>
            )}
          </div>
        </Link>





        {/* Quick add bag - Hidden for Concept Art */}
        {(product as any).listingType !== "CONCEPT_ART" && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute bottom-2 right-2 z-10 flex h-8 w-8 items-center justify-center bg-charcoal rounded-full text-paper active:scale-90 transition-transform cursor-pointer shadow-md"
            aria-label="Quick Add to Bag"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          </button>
        )}

        {/* Double-tap heart overlay animation */}
        {showHeart && (
          <div className="heart-overlay" style={{ animation: "heart-pop 0.8s cubic-bezier(0.17,0.89,0.32,1.28) forwards" }}>
            <svg className="w-16 h-16 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="mt-2 flex flex-col gap-0.5">


        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${product.id}`}
            className="font-sans text-xs font-semibold text-charcoal leading-tight line-clamp-2 hover:text-stone transition-colors"
          >
            {product.name}
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product.id);
            }}
            className="flex-shrink-0 pt-0.5 text-charcoal active:scale-95 transition-transform cursor-pointer"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              className={`h-4 w-4 transition-colors duration-200 ${
                wished ? "fill-charcoal text-charcoal" : "fill-none text-charcoal"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </button>
        </div>

        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-sans text-sm font-extrabold text-charcoal">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
