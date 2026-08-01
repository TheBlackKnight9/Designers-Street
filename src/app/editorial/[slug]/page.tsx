"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { useEditorialArticle } from "@/hooks/useEditorial";
import {
  useStorefrontProducts,
  useStorefrontDesigners,
} from "@/hooks/useStorefrontCatalog";
import { PRODUCTS, DESIGNERS } from "@/lib/mock-data";
import { ShareButton } from "@/components/ShareButton";
import { getDesignerUrl } from "@/lib/routes";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const { article, loading, error } = useEditorialArticle(slug);
  const catalogProducts = useStorefrontProducts();
  const catalogDesigners = useStorefrontDesigners();

  const allProducts = catalogProducts.enabled ? catalogProducts.products : PRODUCTS;
  const designers = catalogDesigners.enabled ? catalogDesigners.designers : DESIGNERS;

  if (loading) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">
            Loading editorial story…
          </p>
        </main>
        <BottomNav />
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] px-6 text-center">
          <h1 className="font-display text-xl font-bold uppercase text-[#2B2B2B] mb-2">
            Article Not Found
          </h1>
          <Link href="/" className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] underline">
            Return Home
          </Link>
        </main>
        <BottomNav />
      </>
    );
  }

  const designer = article.designerId
    ? designers.find((d) => d.id === article.designerId)
    : null;

  return (
    <>
      <TopBar />

      <main className="min-h-screen pb-20 bg-[#FDFCF8]">
        {/* Cover Hero */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] bg-[#E5E0D8]">
          <Image
            src={article.coverImage}
            alt={article.title}
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
              {article.category}
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight uppercase mb-2">
              {article.title}
            </h1>

            {article.authorName && (
              <p className="font-sans text-xs text-white/80">
                By {article.authorName} {article.authorRole ? `· ${article.authorRole}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Excerpt Header */}
        <div className="p-5 sm:p-8 max-w-3xl mx-auto border-b border-[#E8E4DC]">
          <p className="font-display text-base sm:text-lg text-[#2B2B2B] font-semibold leading-relaxed italic">
            &ldquo;{article.excerpt}&rdquo;
          </p>

          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-[#F0ECE4]">
            {designer && (
              <Link
                href={getDesignerUrl(designer?.handle) ?? "#"}
                className="font-sans text-xs font-bold text-[#C5A059] uppercase tracking-wider hover:underline"
              >
                In Collaboration with {designer.name} →
              </Link>
            )}
            <ShareButton
              title={article.title}
              text={article.excerpt}
              path={`/editorial/${article.slug}`}
              className="font-sans text-xs font-bold uppercase tracking-wider text-[#2B2B2B] underline"
            />
          </div>
        </div>

        {/* Article Body Content JSON Blocks */}
        <article className="p-5 sm:p-8 max-w-3xl mx-auto space-y-6">
          {article.contentJson.map((block, i) => {
            switch (block.type) {
              case "heading":
                return (
                  <h2 key={i} className="font-display text-xl font-bold uppercase text-[#2B2B2B] tracking-tight pt-2">
                    {block.text}
                  </h2>
                );

              case "paragraph":
                return (
                  <p key={i} className="font-sans text-sm text-[#4A4A4A] leading-relaxed">
                    {block.text}
                  </p>
                );

              case "quote":
                return (
                  <blockquote key={i} className="my-6 p-4 rounded-xl bg-[#F9F7F2] border-l-4 border-[#C5A059]">
                    <p className="font-display text-base font-semibold text-[#2B2B2B] italic mb-1">
                      &ldquo;{block.text}&rdquo;
                    </p>
                    {block.quoteAuthor && (
                      <cite className="font-sans text-xs font-bold text-[#7A7A7A] uppercase tracking-wider not-italic">
                        — {block.quoteAuthor}
                      </cite>
                    )}
                  </blockquote>
                );

              case "image":
                return (
                  <div key={i} className="my-6 overflow-hidden rounded-xl bg-[#E5E0D8] border border-[#E8E4DC]">
                    {block.imageUrl && (
                      <div className="relative aspect-[16/10] w-full">
                        <Image src={block.imageUrl} alt={block.caption || ""} fill className="object-cover" />
                      </div>
                    )}
                    {block.caption && (
                      <p className="p-3 font-sans text-xs text-[#7A7A7A] text-center italic bg-[#FDFCF8]">
                        {block.caption}
                      </p>
                    )}
                  </div>
                );

              case "product_card": {
                const product = block.productId
                  ? allProducts.find((p) => p.id === block.productId)
                  : null;
                if (!product) return null;
                return (
                  <div key={i} className="my-6 p-4 rounded-xl bg-[#F9F7F2] border border-[#E8E4DC]">
                    <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] block mb-3">
                      🛍 Featured Atelier Piece
                    </span>
                    <div className="max-w-xs mx-auto">
                      <ProductCard product={product} />
                    </div>
                  </div>
                );
              }

              default:
                return null;
            }
          })}
        </article>
      </main>

      <BottomNav />
    </>
  );
}
