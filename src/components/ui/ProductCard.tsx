"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/mock-data";
import { Heart } from "lucide-react";

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
  const wished = isWished(product.id);

  const coverImg = product.images[0];
  const isValidImage = isValidImageUrl(coverImg);

  return (
    <div id={id} className={`group relative flex flex-col ${className}`}>
      {/* Product Image Box — links directly to product page */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--mist)] rounded-lg active:scale-[0.99] transition-transform">
        <Link
          href={`/product/${product.id}`}
          className="block w-full h-full"
          aria-label={product.name}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-[var(--mist)]">
              <span className="font-sans text-[10px] font-medium uppercase tracking-wider text-[var(--stone)]">
                {product.designerName}
              </span>
              <span className="font-sans text-[11px] font-semibold text-[var(--charcoal)] line-clamp-2 mt-1">
                {product.name}
              </span>
            </div>
          )}
        </Link>

        {/* Discreet wishlist heart in top-right corner */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
          }}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center bg-white/80 backdrop-blur-sm rounded-full active:scale-90 transition-transform"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors duration-200 ${
              wished ? "fill-[var(--charcoal)] text-[var(--charcoal)]" : "text-[var(--charcoal)] stroke-[1.5]"
            }`}
          />
        </button>
      </div>

      {/* Product details — designer name + product name + price */}
      <div className="mt-2.5 flex flex-col gap-0.5">
        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--stone)] truncate">
          {product.designerName}
        </p>
        <Link
          href={`/product/${product.id}`}
          className="font-sans text-xs font-medium text-[var(--charcoal)] leading-tight line-clamp-2 hover:underline underline-offset-2 transition-colors"
        >
          {product.name}
        </Link>
        <span className="font-mono text-sm font-semibold text-[var(--charcoal)] mt-0.5">
          {formatPrice(product.price)}
        </span>
      </div>
    </div>
  );
}
