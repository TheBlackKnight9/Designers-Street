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
      className={`product-card relative flex flex-col bg-[#FAFAFA] ${className}`}
    >
      {/* Image with exact rating badge & bag overlay */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F0F0F0] rounded-lg">
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

        {/* Expand → Universal Media Viewer (Home / Store / Designer shop) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const media = productToViewerMedia(product);
            const firstVideo = media.findIndex((m) => m.type === "video");
            openMediaViewer({
              media,
              // Opening a product video enters continuous discovery
              initialIndex: firstVideo >= 0 ? firstVideo : 0,
              continuous: firstVideo >= 0 ? true : undefined,
              source: "product-card",
            });
          }}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center bg-black/50 backdrop-blur-xs rounded-full text-white active:scale-90 transition-transform"
          aria-label="Open media viewer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>

        {/* Free Shipping Badge */}
        {(product as any).listingType !== "CONCEPT_ART" && (
          <span className="absolute top-2 left-2 z-10 bg-emerald-700/90 text-white font-sans text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md backdrop-blur-xs tracking-wider shadow-xs">
            FREE SHIPPING
          </span>
        )}

        {product.videos && product.videos.length > 0 ? (
          <span className="absolute top-2 left-16 z-10 flex h-7 items-center gap-1 rounded-full bg-black/55 px-2 text-[9px] font-bold uppercase tracking-wider text-white pointer-events-none">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
            Video
          </span>
        ) : null}

        {/* Rating badge: bottom-left (★ 5.0 style) */}
        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 bg-white/95 backdrop-blur-xs rounded-full shadow-xs border border-gray-100">
          <span className="text-[10px] text-amber-500">★</span>
          <span className="font-sans text-[10px] font-bold text-[#2B2B2B]">
            {(product.rating ?? 4.8).toFixed(1)}
          </span>
        </div>

        {/* Add-to-bag icon: bottom-right (white circular bag button) */}
        <button
          type="button"
          onClick={handleQuickAdd}
          className="absolute bottom-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center bg-white/95 backdrop-blur-xs rounded-full shadow-md border border-[#F0F0F0] active:scale-90 transition-transform cursor-pointer"
          aria-label="Quick Add to Bag"
        >
          <svg className="w-4 h-4 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
        </button>

        {/* Double-tap heart overlay animation */}
        {showHeart && (
          <div className="heart-overlay" style={{ animation: "heart-pop 0.8s cubic-bezier(0.17,0.89,0.32,1.28) forwards" }}>
            <svg className="w-16 h-16 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Details matching image layout */}
      <div className="mt-2 flex flex-col gap-0.5 px-0.5">
        {/* Designer / Maker brand tag */}
        <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-[#A0A0A0]">
          {product.designerName}
        </p>

        {/* Product title & Wishlist icon row */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${product.id}`}
            className="font-sans text-xs font-medium text-[#2B2B2B] leading-tight line-clamp-2 hover:text-[#7A7A7A] transition-colors"
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
            className="flex-shrink-0 pt-0.5 text-[#2B2B2B] active:scale-95 transition-transform cursor-pointer"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              className={`h-4.5 w-4.5 transition-colors duration-200 ${
                wished ? "fill-[#2B2B2B] text-[#2B2B2B]" : "fill-none text-[#2B2B2B]"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </button>
        </div>

        {/* Price + crossed out MRP */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-sans text-sm font-bold text-[#2B2B2B]">
            {formatPrice(product.price)}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="font-sans text-[10px] text-[#A0A0A0] line-through">
              MRP: {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        {/* Best Price badge */}
        {product.bestPrice && (
          <div className="mt-1.5 self-start border border-green-700 bg-green-50/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-green-800 tracking-wide uppercase">
            Best Price: {formatPrice(product.bestPrice)}*
          </div>
        )}

        {/* Delivery / Status metadata */}
        {product.deliveryText && (
          <p className="text-[10px] text-green-700 font-medium mt-1 flex items-center gap-1">
            <span>⚡</span> {product.deliveryText}
          </p>
        )}

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mt-1.5">
            {product.colors.map((c) => (
              <span
                key={c}
                className="w-3 h-3 rounded-full border border-gray-200 block shadow-xs"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
