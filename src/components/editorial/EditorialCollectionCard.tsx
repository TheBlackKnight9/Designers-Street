"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { getCategoryHero } from "@/lib/fashion-images";

function isValidImageUrl(url?: string | null): boolean {
  if (!url || url === "na" || url.trim() === "") return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

type EditorialCollectionCardProps = {
  category: Category;
  index: number;
  imageOverride?: string;
  designerName?: string;
};

function resolveHeroImage(category: Category, imageOverride?: string): string {
  if (isValidImageUrl(imageOverride)) return imageOverride!;
  if (isValidImageUrl(category.image)) return category.image;
  return getCategoryHero(category.slug);
}

export function EditorialCollectionCard({
  category,
  index,
  imageOverride,
  designerName,
}: EditorialCollectionCardProps) {
  const heroImage = resolveHeroImage(category, imageOverride);
  const atelier = designerName?.trim() || "Atelier";

  return (
    <Link
      href={`/category/${category.slug}`}
      className="block px-4 mb-6 active:scale-[0.99] transition-transform max-w-lg mx-auto group"
    >
      <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-[var(--mist)]">
        <Image
          src={heroImage}
          alt={category.label}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 512px) 92vw, 480px"
          priority={index < 2}
        />

        {/* Subtle dark gradient scrim for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

        {/* Bottom editorial typography overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/70 mb-1">
            {atelier}
          </p>
          <h3 className="font-display text-xl font-semibold text-white leading-tight mb-3">
            {category.label}
          </h3>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-white/90 border-b border-white/40 pb-0.5 hover:border-white transition-colors">
            Explore Collection
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
