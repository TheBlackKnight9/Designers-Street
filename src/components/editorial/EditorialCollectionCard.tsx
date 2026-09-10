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
      className="block px-4 mb-7 active:scale-[0.99] transition-transform max-w-lg mx-auto group"
    >
      <div className="relative w-full aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-[#F5F6F8] border border-black/5 shadow-md group-hover:shadow-xl transition-all duration-500">
        <Image
          src={heroImage}
          alt={category.label}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 512px) 92vw, 480px"
          priority={index < 2}
        />

        {/* Subtle dark gradient scrim for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Bottom editorial typography overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 mb-1.5">
            {atelier}
          </p>
          <h3 className="font-serif text-2xl md:text-3xl font-normal text-white leading-tight mb-4 drop-shadow-sm">
            {category.label}
          </h3>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-stone-950 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-md group-hover:bg-[#FF6B00] group-hover:text-white transition-all">
            Explore Edit
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
