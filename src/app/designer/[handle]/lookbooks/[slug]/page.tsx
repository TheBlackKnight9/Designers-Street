"use client";

import { use, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { useLookbook } from "@/hooks/useLuxury";
import { useStorefrontDesigner } from "@/hooks/useStorefrontCatalog";
import { useOpenMediaViewer } from "@/context/MediaViewerContext";
import { DESIGNERS, PRODUCTS, formatPrice } from "@/lib/mock-data";
import { getDesignerUrl } from "@/lib/routes";

interface PageProps {
  params: Promise<{ handle: string; slug: string }>;
}

export default function LookbookDetailPage({ params }: PageProps) {
  const { handle, slug } = use(params);
  const { designer: apiDesigner } = useStorefrontDesigner(handle);

  const decodedHandle = decodeURIComponent(handle).trim().toLowerCase();
  const mockDesigner = DESIGNERS.find(
    (d) =>
      d.handle.toLowerCase() === decodedHandle ||
      d.id.toLowerCase() === decodedHandle
  );
  const designer = apiDesigner ?? mockDesigner;

  const { lookbook, loading, error } = useLookbook(designer?.id, slug);
  const { openMediaViewer } = useOpenMediaViewer();

  const openLookbookViewer = useCallback(
    (initialIndex = 0) => {
      if (!lookbook?.items?.length) return;
      const media = lookbook.items.map((item) => ({
        id: item.id,
        type: item.mediaKind,
        url: item.mediaUrl,
        thumbnailUrl: item.mediaKind === "video" ? item.mediaUrl : null,
        displayOrder: 0,
        title: item.caption || lookbook.title,
        designerName: designer?.name || "",
        productTag: item.productId
          ? (() => {
              const p = PRODUCTS.find((prod) => prod.id === item.productId);
              return p
                ? { name: p.name, price: p.price, productId: p.id }
                : undefined;
            })()
          : undefined,
      }));

      openMediaViewer({
        media,
        initialIndex,
        continuous: true,
        source: "lookbook-detail",
      });
    },
    [lookbook, designer, openMediaViewer]
  );

  if (loading) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">
            Loading lookbook…
          </p>
        </main>
        <BottomNav />
      </>
    );
  }

  if (error || !lookbook) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] px-6 text-center">
          <h1 className="font-display text-xl font-bold uppercase text-[#2B2B2B] mb-2">
            Lookbook Not Found
          </h1>
          <p className="font-sans text-xs text-[#7A7A7A] mb-6">
            This collection campaign may have expired or been moved.
          </p>
          <Link
            href={getDesignerUrl(designer?.handle) ?? "/store"}
            className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] underline"
          >
            Return to House Profile
          </Link>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-20 bg-[#FDFCF8]">
        {/* Cover Hero */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] bg-[#E5E0D8]">
          <Image
            src={lookbook.coverImage}
            alt={lookbook.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Back Link */}
          <Link
            href={getDesignerUrl(handle) ?? "/store"}
            className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
            aria-label="Back to designer profile"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-white/90 backdrop-blur-xs font-sans text-[9px] font-extrabold uppercase tracking-widest text-[#2B2B2B]">
                {lookbook.kind}
              </span>
              {lookbook.season && (
                <span className="font-sans text-[10px] font-bold text-white/80 uppercase tracking-wider">
                  {lookbook.season}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl font-bold text-white leading-tight uppercase">
              {lookbook.title}
            </h1>
            {designer && (
              <p className="font-sans text-xs text-white/90 mt-1">
                by {designer.name}
              </p>
            )}
          </div>
        </div>

        {/* Description & Presenter CTA */}
        <div className="p-5 border-b border-[#E8E4DC]">
          {lookbook.description && (
            <p className="font-sans text-xs text-[#4A4A4A] leading-relaxed mb-4">
              {lookbook.description}
            </p>
          )}

          <button
            type="button"
            onClick={() => openLookbookViewer(0)}
            className="w-full h-12 bg-[#2B2B2B] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full btn-press flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
            Play Full Lookbook Experience
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="p-4">
          <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[#A0A0A0] mb-3">
            Collection Campaign ({lookbook.items.length} Slides)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {lookbook.items.map((item, index) => {
              const taggedProduct = item.productId
                ? PRODUCTS.find((p) => p.id === item.productId)
                : null;

              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden bg-[#F0ECE4] rounded-lg border border-[#E8E4DC]"
                >
                  <button
                    type="button"
                    onClick={() => openLookbookViewer(index)}
                    className="relative block w-full aspect-[3/4] overflow-hidden"
                    aria-label={`Open slide ${index + 1}`}
                  >
                    <Image
                      src={item.mediaUrl}
                      alt={item.caption || `Lookbook item ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 300px"
                    />
                    {item.mediaKind === "video" && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                        <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5.14v14l11-7-11-7z" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Caption & Tagged Product Link */}
                  <div className="p-3 bg-[#FDFCF8]">
                    {item.caption && (
                      <p className="font-sans text-[11px] text-[#2B2B2B] font-medium line-clamp-1 mb-1">
                        {item.caption}
                      </p>
                    )}
                    {taggedProduct ? (
                      <Link
                        href={`/product/${taggedProduct.id}`}
                        className="inline-flex items-center gap-1 font-sans text-[10px] font-bold text-[#C5A059] uppercase tracking-wider hover:underline"
                      >
                        <span>🛍 {taggedProduct.name} · {formatPrice(taggedProduct.price)}</span>
                      </Link>
                    ) : (
                      <span className="font-sans text-[9px] text-[#A0A0A0] uppercase tracking-wider">
                        Editorial Slide #{index + 1}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
