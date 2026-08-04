"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import { CATEGORIES } from "@/lib/mock-data";
import { useStorefrontCategories } from "@/hooks/useStorefrontCatalog";
import { resolveCategoryImageUrl } from "@/lib/fashion-images";
import { sanitizeImageUrl } from "@/lib/utils/image-url";

export default function CategoryIndexPage() {
  // Track expanded state for each main category slug (hidden by default)
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const catalog = useStorefrontCategories();
  const categories =
    catalog.enabled && catalog.categories.length > 0
      ? catalog.categories
      : CATEGORIES;

  const toggleCategory = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMap((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-16 bg-[#FDFCF8]">
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
            CATEGORIES
          </h1>
          <p className="font-sans text-xs text-[#7A7A7A] mt-0.5">
            Browse custom edits and designer collections
          </p>
        </div>

        {/* Categories Stack */}
        {catalog.enabled && (catalog.loading || catalog.error) ? (
          <CatalogStatus
            loading={catalog.loading}
            error={catalog.error}
            onRetry={catalog.reload}
            skeletonCount={3}
          />
        ) : (
        <div className="px-4 space-y-5 pb-6">
          {categories.map((cat) => {
            const isExpanded = !!expandedMap[cat.slug];
            const hasChildren = cat.children && cat.children.length > 0;
            const bannerImage = sanitizeImageUrl(
              resolveCategoryImageUrl(cat.slug, cat.image)
            );

            return (
              <div key={cat.slug} className="flex flex-col gap-2.5">
                {/* Main Category Banner Card */}
                <div className="relative aspect-[16/8] w-full rounded-2xl overflow-hidden bg-[#D5DBE5] block group neu-raised-sm">
                  {/* Category Image link to full category page */}
                  <Link href={`/category/${cat.slug}`} className="absolute inset-0 block">
                    <Image
                      src={bannerImage}
                      alt={cat.label}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </Link>

                  {/* Card Bottom Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between pointer-events-none z-10">
                    <div className="pointer-events-auto flex items-center gap-2">
                      <Link href={`/category/${cat.slug}`}>
                        <h2 className="font-sans text-lg font-extrabold text-white uppercase tracking-wider hover:underline">
                          {cat.label}
                        </h2>
                      </Link>
                      {cat.caption && (
                        <p className="hidden xs:block font-sans text-[10px] text-white/80 mt-0.5 line-clamp-1 font-medium">
                          {cat.caption}
                        </p>
                      )}
                    </div>

                    {/* Pure Arrow Icon button (No text) */}
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => toggleCategory(cat.slug, e)}
                        className="pointer-events-auto flex items-center justify-center w-8 h-8 bg-white/95 backdrop-blur-md text-[#2B2B2B] rounded-full shadow-md active:scale-90 transition-all cursor-pointer border border-white/40 flex-shrink-0"
                        aria-label={`Toggle ${cat.label} subcategories`}
                      >
                        <svg
                          className={`w-4 h-4 text-[#2B2B2B] transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : "rotate-0"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subcategories Pills (Shown only when arrow is toggled) */}
                {isExpanded && hasChildren && (
                  <div className="flex flex-wrap gap-2 pt-1 px-1 animate-fade-up">
                    {cat.children!.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/category/${sub.slug}`}
                        className="px-3.5 py-2 bg-white border border-[#E0E0E0] rounded-full font-sans text-xs font-bold text-[#2B2B2B] neu-raised-sm active:scale-95 transition-all hover:bg-[#F0F0F0]"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}
