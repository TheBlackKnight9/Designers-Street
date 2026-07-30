"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/mock-data";
import type { ViewerMediaItem } from "@/lib/media/types";

type FloatingProductCardProps = {
  item: ViewerMediaItem;
  onOpenProduct?: () => void;
};

export function FloatingProductCard({
  item,
  onOpenProduct,
}: FloatingProductCardProps) {
  if (!item.productId) return null;

  const image = item.productImage || item.thumbnailUrl;
  const lowStock =
    typeof item.piecesRemaining === "number" && item.piecesRemaining <= 8;

  return (
    <button
      type="button"
      onClick={onOpenProduct}
      className="pointer-events-auto mb-3 w-full max-w-[78%] text-left rounded-2xl border border-white/25 bg-white/12 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.28)] active:scale-[0.98] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ animation: "ds-glass-in 0.35s ease-out" }}
      aria-label={`View ${item.productName || "product"}`}
    >
      <div className="flex gap-3 p-2.5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="font-sans text-[11px] font-bold text-white truncate leading-snug">
            {item.productName || "Piece"}
          </p>
          <p className="font-sans text-[10px] uppercase tracking-wider text-white/70 truncate mt-0.5">
            {item.designerName || "Designer"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {item.price != null && (
              <span className="font-sans text-xs font-extrabold text-white">
                {formatPrice(item.price)}
              </span>
            )}
            {item.rating != null && (
              <span className="font-sans text-[10px] font-semibold text-white/90">
                ★ {item.rating.toFixed(1)}
              </span>
            )}
          </div>
          {lowStock && (
            <p className="mt-1 font-sans text-[9px] font-bold uppercase tracking-wider text-amber-200">
              Only {item.piecesRemaining} left
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
