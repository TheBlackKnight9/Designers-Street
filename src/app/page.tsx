"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import { useEditorialHome } from "@/hooks/useEditorial";
import {
  useStorefrontProducts,
  useStorefrontCategories,
  useStorefrontDesigners,
} from "@/hooks/useStorefrontCatalog";
import { FeaturedSectionRenderer } from "@/components/editorial/FeaturedSectionRenderer";
import { DEMO_LOOKBOOKS } from "@/lib/phase8-demo";
import { CATEGORIES, DESIGNERS, PRODUCTS } from "@/lib/mock-data";

export default function HomePage() {
  const { data: editorialData, loading: editorialLoading } = useEditorialHome();
  const catalogProducts = useStorefrontProducts({ limit: 24 });
  const catalogCategories = useStorefrontCategories();
  const catalogDesigners = useStorefrontDesigners();

  const products = catalogProducts.enabled ? catalogProducts.products : PRODUCTS;
  const designers = catalogDesigners.enabled ? catalogDesigners.designers : DESIGNERS;
  const categories = catalogCategories.enabled ? catalogCategories.categories : CATEGORIES;

  const [activeGender, setActiveGender] = useState<"all" | "women" | "men">("all");

  const filteredProducts = products.filter((p) => {
    if (activeGender === "all") return true;
    return p.gender === activeGender || p.gender === "unisex";
  });

  const promoBanner =
    "⚡ COMPLIMENTARY EXPRESS DELIVERY • ✨ 100% AUTHENTIC ATELIER COUTURE • 🏷️ LIMITED SERIALIZED EDITIONS";

  return (
    <>
      <TopBar />

      <main className="min-h-screen bg-[#FDFCF8] pb-16">
        {/* Ticker / Announcement Strip */}
        <div className="bg-[#101010] text-[#F3F0E9] text-[10px] font-sans font-bold uppercase tracking-widest py-2 px-4 text-center overflow-hidden">
          <span className="inline-block animate-pulse">{promoBanner}</span>
        </div>

        {/* Gender Filter Pills */}
        <div className="px-4 py-3 bg-[#FDFCF8] border-b border-[#E8E4DC] flex items-center justify-center gap-2">
          {(["all", "women", "men"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setActiveGender(g)}
              className={`px-4 py-1.5 rounded-full font-sans text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                activeGender === g
                  ? "bg-[#101010] text-white shadow-xs"
                  : "bg-[#F3F0E9] text-[#5C5346] hover:bg-[#E3DBCC]"
              }`}
            >
              {g === "all" ? "All Collections" : g === "women" ? "Womenswear" : "Menswear"}
            </button>
          ))}
        </div>

        {/* Dynamic Editorial Sections */}
        {editorialLoading ? (
          <CatalogStatus loading skeletonCount={3} />
        ) : editorialData?.sections?.length ? (
          <div>
            {editorialData.sections.map((section) => (
              <FeaturedSectionRenderer
                key={section.id}
                section={section}
                campaign={editorialData.campaign}
                collections={editorialData.collections}
                articles={editorialData.articles}
                designers={designers}
                products={filteredProducts}
                lookbooks={DEMO_LOOKBOOKS}
              />
            ))}
          </div>
        ) : null}

        {/* Browse Category Posters Rail */}
        <section className="py-6 px-4 border-t border-[#E8E4DC]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059]">
                Taxonomy Curation
              </span>
              <h2 className="font-display text-xl font-bold uppercase text-[#2B2B2B] tracking-tight">
                Browse By Category
              </h2>
            </div>
            <Link
              href="/category"
              className="font-sans text-xs font-bold uppercase tracking-wider text-[#2B2B2B] underline"
            >
              All Categories
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative flex-shrink-0 w-36 aspect-[3/4] overflow-hidden rounded-xl bg-[#E5E0D8] border border-[#E8E4DC]"
              >
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="144px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <h3 className="font-display text-xs font-bold uppercase leading-tight">
                    {cat.label}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All Products Catalog Grid */}
        <section className="py-6 px-4 border-t border-[#E8E4DC]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059]">
                Complete Catalog
              </span>
              <h2 className="font-display text-xl font-bold uppercase text-[#2B2B2B] tracking-tight">
                All Atelier Pieces ({filteredProducts.length})
              </h2>
            </div>
            <Link
              href="/store"
              className="font-sans text-xs font-bold uppercase tracking-wider text-[#2B2B2B] underline"
            >
              Shop All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.slice(0, 12).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <Footer />
      </main>

      <BottomNav />
    </>
  );
}
