"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

type NewmeFeaturedRailProps = {
  products: Product[];
};

export function NewmeFeaturedRail({ products }: NewmeFeaturedRailProps) {
  const featured = products.slice(0, 8);
  if (!featured.length) return null;

  return (
    <section className="py-5 bg-white">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-display text-base font-semibold text-[var(--charcoal)] tracking-wide">
          Curated This Week
        </h2>
        <Link href="/store" className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--stone)] hover:text-[var(--charcoal)] transition-colors">
          View All
        </Link>
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-1">
        {featured.map((product, index) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="relative flex-shrink-0 w-[42%] min-w-[150px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#F5F6F8] border border-gray-100/80 shadow-2xs group active:scale-[0.99] transition-all"
          >
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="160px"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {index === 0 && (
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-[#FF6B00] text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-xs">
                New Drop
              </span>
            )}
            <div className="absolute bottom-2.5 left-2.5 right-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/80 truncate">
                {product.designerName}
              </p>
              <p className="text-xs font-bold text-white leading-tight line-clamp-2 mt-0.5">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
