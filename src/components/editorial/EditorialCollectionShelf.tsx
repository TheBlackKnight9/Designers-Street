"use client";

import Image from "next/image";
import Link from "next/link";
import type { EditorialCollectionData } from "@/lib/types";

type EditorialCollectionShelfProps = {
  collection: EditorialCollectionData;
  className?: string;
};

export function EditorialCollectionShelf({
  collection,
  className = "",
}: EditorialCollectionShelfProps) {
  return (
    <section className={`py-6 px-4 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059]">
            Curated Collection
          </span>
          <h2 className="font-display text-xl font-bold uppercase text-[#2B2B2B] tracking-tight">
            {collection.title}
          </h2>
        </div>
        <Link
          href={`/collections/${collection.slug}`}
          className="font-sans text-xs font-bold uppercase tracking-wider text-[#2B2B2B] underline"
        >
          View All
        </Link>
      </div>

      {collection.tagline && (
        <p className="font-sans text-xs text-[#7A7A7A] mb-4">
          {collection.tagline}
        </p>
      )}

      {/* Featured Cover Card */}
      <Link
        href={`/collections/${collection.slug}`}
        className="group relative block w-full aspect-[16/9] overflow-hidden rounded-xl bg-[#E5E0D8] border border-[#E8E4DC] mb-3"
      >
        <Image
          src={collection.coverImage}
          alt={collection.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-display text-base font-bold uppercase leading-tight">
            {collection.title}
          </h3>
          {collection.curatorNotes && (
            <p className="font-sans text-[10px] text-white/80 line-clamp-1 mt-0.5">
              💡 {collection.curatorNotes}
            </p>
          )}
        </div>
      </Link>
    </section>
  );
}
