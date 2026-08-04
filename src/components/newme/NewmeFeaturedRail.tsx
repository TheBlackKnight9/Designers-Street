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
    <section className="py-4 bg-paper">
      <h2 className="px-4 mb-3 font-sans text-sm font-black uppercase tracking-wide text-charcoal">
        FEATURED{" "}
        <span className="text-[var(--newme-green)]">THIS WEEK</span>
      </h2>
      <div className="flex gap-2.5 px-4 overflow-x-auto hide-scrollbar pb-1">
        {featured.map((product, index) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="relative flex-shrink-0 w-[42%] min-w-[150px] aspect-[4/5] rounded-lg overflow-hidden bg-mist"
          >
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="160px"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {index === 0 && (
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-[var(--newme-pink)] text-paper text-[9px] font-extrabold uppercase rounded-full">
                LIVE
              </span>
            )}
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[9px] font-bold uppercase text-paper/80 truncate">
                {product.designerName}
              </p>
              <p className="text-[11px] font-extrabold text-paper leading-tight line-clamp-2">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
