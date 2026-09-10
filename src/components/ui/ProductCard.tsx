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
  const secondImg = product.images[1];
  const isValidCover = isValidImageUrl(coverImg);
  const isValidSecond = isValidImageUrl(secondImg);

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <div id={id} className={`group relative flex flex-col ${className}`}>
      {/* Product Image Stage — soft-gray rounded container matching PDP */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F6F8] rounded-2xl md:rounded-3xl border border-gray-100/80 shadow-2xs active:scale-[0.99] transition-all">
        <Link
          href={`/product/${product.id}`}
          className="block w-full h-full relative"
          aria-label={product.name}
        >
          {isValidCover ? (
            <>
              <Image
                src={coverImg}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-all duration-700 ${
                  isValidSecond
                    ? "group-hover:opacity-0 group-hover:scale-105"
                    : "group-hover:scale-105"
                }`}
                loading="lazy"
              />
              {isValidSecond && (
                <Image
                  src={secondImg}
                  alt={`${product.name} alternate view`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-[#F5F6F8]">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {product.designerName}
              </span>
              <span className="font-serif text-sm font-medium text-gray-900 line-clamp-2 mt-1">
                {product.name}
              </span>
            </div>
          )}
        </Link>

        {/* Top-left subtle craft / category pill */}
        {product.category && (
          <span className="absolute top-2.5 left-2.5 z-10 craft-pill pointer-events-none">
            {product.category}
          </span>
        )}

        {/* Circular Wishlist Heart in top-right corner */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md shadow-xs active:scale-90 transition-all ${
            wished
              ? "bg-rose-50 text-rose-500 shadow-sm"
              : "bg-white/90 text-gray-700 hover:bg-white"
          }`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              wished ? "fill-rose-500 text-rose-500" : "stroke-[1.8]"
            }`}
          />
        </button>

        {/* Stock status badge if scarce */}
        {product.piecesRemaining != null && product.piecesRemaining <= 5 && (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[9px] font-bold text-white shadow-2xs pointer-events-none uppercase tracking-wider">
            {product.piecesRemaining} left
          </div>
        )}
      </div>

      {/* Product details — designer name + editorial product name + clean price */}
      <div className="mt-2.5 flex flex-col gap-0.5 px-0.5">
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 group-hover:text-[#FF6B00] transition-colors truncate">
          {product.designerName}
        </p>
        <Link
          href={`/product/${product.id}`}
          className="font-serif text-sm md:text-[15px] font-normal text-stone-900 leading-snug line-clamp-1 group-hover:text-[#FF6B00] transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-sans text-xs md:text-sm font-bold text-stone-950 tracking-tight">
            {formatPrice(product.price)}
          </span>
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.5 bg-orange-50 text-[#EA580C] border border-orange-200 text-[9px] font-bold rounded-full uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
