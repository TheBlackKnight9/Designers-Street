"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { useEditorialCollection } from "@/hooks/useEditorial";
import { useStorefrontProducts } from "@/hooks/useStorefrontCatalog";
import { PRODUCTS } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CollectionDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const { collection, loading, error } = useEditorialCollection(slug);
  const catalogProducts = useStorefrontProducts();

  const allProducts = catalogProducts.enabled ? catalogProducts.products : PRODUCTS;

  if (loading) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">
            Loading campaign collection…
          </p>
        </main>
        <BottomNav />
      </>
    );
  }

  if (error || !collection) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] px-6 text-center">
          <h1 className="font-display text-xl font-bold uppercase text-[#2B2B2B] mb-2">
            Collection Not Found
          </h1>
          <Link href="/" className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] underline">
            Return Home
          </Link>
        </main>
        <BottomNav />
      </>
    );
  }

  const collectionProducts = collection.items
    .map((item) => allProducts.find((p) => p.id === item.productId))
    .filter(Boolean);

  const displayProducts = collectionProducts.length ? collectionProducts : allProducts.slice(0, 4);

  return (
    <>
      <TopBar />

      <main className="min-h-screen pb-20 bg-[#FDFCF8]">
        {/* Cover Hero */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] bg-[#E5E0D8]">
          <Image
            src={collection.coverImage}
            alt={collection.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Back Button */}
          <Link
            href="/"
            className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
            aria-label="Return home"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-xs font-sans text-[9px] font-extrabold uppercase tracking-widest text-[#2B2B2B] mb-2 inline-block">
              Curated Collection
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight uppercase mb-1">
              {collection.title}
            </h1>
            {collection.tagline && (
              <p className="font-sans text-xs text-white/85 uppercase tracking-wider">
                {collection.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Curator Notes & Description */}
        <div className="p-5 sm:p-8 max-w-3xl mx-auto border-b border-[#E8E4DC]">
          {collection.description && (
            <p className="font-sans text-xs sm:text-sm text-[#4A4A4A] leading-relaxed mb-4">
              {collection.description}
            </p>
          )}

          {collection.curatorNotes && (
            <div className="p-4 rounded-xl bg-[#F9F7F2] border border-[#E8E4DC]">
              <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] block mb-1">
                💡 Senior Curator Notes
              </span>
              <p className="font-sans text-xs text-[#2B2B2B] font-medium italic">
                &ldquo;{collection.curatorNotes}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="p-5 sm:p-8 max-w-5xl mx-auto">
          <h2 className="font-sans text-xs font-extrabold uppercase tracking-widest text-[#A0A0A0] mb-4">
            Curated Atelier Pieces ({displayProducts.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {displayProducts.map((p) => (
              <ProductCard key={p!.id} product={p!} />
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
