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
  const secondImg = product.images[1];

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <div className="flex flex-col group">
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden bg-[#F5F6F8] border border-gray-100/80 shadow-2xs active:scale-[0.99] transition-all">
        <Link href={`/product/${product.id}`} className="absolute inset-0 block">
          {cover ? (
            <>
              <Image
                src={cover}
                alt={product.name}
                fill
                className={`object-cover transition-all duration-700 ${
                  secondImg
                    ? "group-hover:opacity-0 group-hover:scale-105"
                    : "group-hover:scale-105"
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {secondImg && (
                <Image
                  src={secondImg}
                  alt={`${product.name} alternate view`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-medium">
              {product.name.slice(0, 12)}
            </div>
          )}
        </Link>

        {/* Top-left subtle craft / category pill */}
        {product.category && (
          <span className="absolute top-2.5 left-2.5 z-10 craft-pill pointer-events-none">
            {product.category}
          </span>
        )}

        {/* Circular Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md shadow-xs active:scale-90 transition-all z-10 ${
            wished
              ? "bg-rose-50 text-rose-500 shadow-sm"
              : "bg-white/90 text-gray-700 hover:bg-white"
          }`}
          aria-label="Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
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

      {/* Details — designer name + editorial product name + clean price */}
      <div className="mt-2.5 px-0.5 flex flex-col gap-0.5">
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
