"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/mock-data";

type NewmeProductCardProps = {
  product: Product;
};

function discountPercent(price: number, mrp?: number) {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function NewmeProductCard({ product }: NewmeProductCardProps) {
  const { addItem } = useCart();
  const { isWished, toggle } = useWishlist();
  const wished = isWished(product.id);
  const discount = discountPercent(product.price, product.mrp);
  const cover = product.images[0];

  return (
    <div className="flex flex-col">
      <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-mist">
        <Link href={`/product/${product.id}`} className="absolute inset-0">
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              className="object-cover"
              sizes="50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-stone font-bold">
              {product.name.slice(0, 12)}
            </div>
          )}
        </Link>

        {discount && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[var(--newme-green)] text-charcoal text-[9px] font-extrabold rounded">
            {discount}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={() => toggle(product.id)}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-paper/90 rounded-full shadow-sm"
          aria-label="Wishlist"
        >
          <svg
            className={`w-4 h-4 ${wished ? "fill-charcoal text-charcoal" : "text-charcoal"}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            fill={wished ? "currentColor" : "none"}
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() =>
            addItem({
              productId: product.id,
              name: product.name,
              brand: product.designerName,
              price: product.price,
              size: product.sizes[0] || "M",
              image: product.images[0],
            })
          }
          className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center bg-charcoal text-paper rounded-full shadow-md active:scale-95"
          aria-label="Add to bag"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
        </button>

        <div className="absolute bottom-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-paper/95 rounded-full text-[10px] font-bold">
          <span className="text-amber-500">★</span>
          {(product.rating ?? 4.8).toFixed(1)}
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-silver truncate">
          {product.designerName}
        </p>
        <Link
          href={`/product/${product.id}`}
          className="text-xs font-semibold text-charcoal leading-tight line-clamp-2 hover:underline"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm font-extrabold text-charcoal">
            {formatPrice(product.price)}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-[10px] text-silver line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>
        {product.deliveryText && (
          <p className="text-[10px] font-bold text-[var(--newme-green-dark)] mt-0.5">
            ⚡ {product.deliveryText}
          </p>
        )}
      </div>
    </div>
  );
}
