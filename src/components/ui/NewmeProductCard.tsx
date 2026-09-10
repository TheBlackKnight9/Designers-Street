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
            <Image
              src={cover}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-medium">
              {product.name.slice(0, 12)}
            </div>
          )}
        </Link>

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
      </div>

      {/* Details */}
      <div className="mt-2.5 px-0.5 flex flex-col gap-0.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">
          {product.designerName}
        </p>
        <Link
          href={`/product/${product.id}`}
          className="text-xs md:text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#FF6B00] transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-sans text-sm md:text-base font-extrabold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.2 bg-orange-50 text-[#EA580C] border border-orange-200 text-[9px] font-extrabold rounded-full">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
