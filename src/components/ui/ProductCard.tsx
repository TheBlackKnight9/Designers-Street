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
import { Heart, ShoppingBag, Maximize2, Play, Star } from "lucide-react";

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
  const isValidImage = isValidImageUrl(coverImg);

  return (
    <div id={id} className={`group relative flex flex-col ${className}`}>
      {/* Product Image Box */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-mist rounded-xl active:scale-[0.99] transition-transform"
        onClick={handleImageTap}
      >
        {isValidImage ? (
          <Image
            src={coverImg}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-[#F3F0E9]">
            <span className="font-sans text-[10px] font-extrabold uppercase tracking-wider text-charcoal/60">
              {product.designerName}
            </span>
            <span className="font-sans text-[11px] font-extrabold text-charcoal line-clamp-2 mt-1">
              {product.name}
            </span>
          </div>
        )}

        {/* Media Viewer expand launcher button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const media = productToViewerMedia(product);
            const firstVideo = media.findIndex((m) => m.type === "video");
            openMediaViewer({
              media,
              initialIndex: firstVideo >= 0 ? firstVideo : 0,
              continuous: firstVideo >= 0 ? true : undefined,
              source: "product-card",
            });
          }}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center bg-black/50 backdrop-blur-xs rounded-full text-white active:scale-90 transition-transform"
          aria-label="Open media viewer"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>

        {/* Free Shipping Badge */}
        {(product as { listingType?: string }).listingType !== "CONCEPT_ART" && (
          <span className="absolute top-2 left-2 z-10 bg-[var(--accent-sale)] text-white font-sans text-[8px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
            FREE SHIP
          </span>
        )}

        {product.videos && product.videos.length > 0 ? (
          <span className="absolute top-2 left-16 z-10 flex h-7 items-center gap-1 rounded-full bg-black/55 px-2 text-[9px] font-bold uppercase tracking-wider text-white pointer-events-none">
            <Play className="w-3 h-3 fill-white text-white" />
            Video
          </span>
        ) : null}

        {/* Rating badge */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 bg-paper/95 rounded-md shadow-sm">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="font-sans text-[10px] font-extrabold text-charcoal">
            {(product.rating ?? 4.8).toFixed(1)}
          </span>
        </div>

        {/* Quick add bag */}
        <button
          type="button"
          onClick={handleQuickAdd}
          className="absolute bottom-2 right-2 z-10 flex h-8 w-8 items-center justify-center bg-charcoal rounded-full text-paper active:scale-90 transition-transform cursor-pointer shadow-md"
          aria-label="Quick Add to Bag"
        >
          <ShoppingBag className="w-4 h-4 text-paper stroke-[1.8]" />
        </button>

        {/* Double-tap heart overlay animation */}
        {showHeart && (
          <div className="heart-overlay" style={{ animation: "heart-pop 0.8s cubic-bezier(0.17,0.89,0.32,1.28) forwards" }}>
            <Heart className="w-16 h-16 text-white fill-white drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="mt-2 flex flex-col gap-0.5">
        <p className="font-sans text-[9px] font-extrabold uppercase tracking-widest text-silver">
          {product.designerName}
        </p>

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
            <Heart
              className={`h-4 w-4 transition-colors duration-200 ${
                wished ? "fill-charcoal text-charcoal" : "text-charcoal stroke-[1.8]"
              }`}
            />
          </button>
        </div>

        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-sans text-sm font-extrabold text-charcoal">
            {formatPrice(product.price)}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="font-sans text-[10px] text-silver line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        {product.bestPrice && (
          <div className="mt-1 self-start bg-mist px-1.5 py-0.5 rounded text-[9px] font-extrabold text-charcoal tracking-wide uppercase">
            Best: {formatPrice(product.bestPrice)}*
          </div>
        )}

        {product.deliveryText && (
          <p className="text-[10px] text-[var(--accent-sale)] font-bold mt-1 flex items-center gap-1">
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
