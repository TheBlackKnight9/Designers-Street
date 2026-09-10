"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/mock-data";
import { Heart } from "lucide-react";

type NewmeProductCardProps = {
  product: Product;
};

export function NewmeProductCard({ product }: NewmeProductCardProps) {
  const { isWished, toggle } = useWishlist();
  const wished = isWished(product.id);
  const cover = product.images[0];

  return (
    <div className="flex flex-col">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[var(--mist)] group">
        <Link href={`/product/${product.id}`} className="absolute inset-0">
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--stone)] font-medium">
              {product.name.slice(0, 12)}
            </div>
          )}
        </Link>

        {/* Discreet wishlist heart */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
          }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full active:scale-90 transition-transform z-10"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${wished ? "fill-[var(--charcoal)] text-[var(--charcoal)]" : "text-[var(--charcoal)] stroke-[1.5]"}`}
          />
        </button>
      </div>

      <div className="mt-2.5 px-0.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--stone)] truncate mb-0.5">
          {product.designerName}
        </p>
        <Link
          href={`/product/${product.id}`}
          className="text-xs font-medium text-[var(--charcoal)] leading-tight line-clamp-2 hover:underline underline-offset-2"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-mono text-sm font-semibold text-[var(--charcoal)]">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
