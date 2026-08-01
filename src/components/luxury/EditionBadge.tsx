"use client";

import { getEditionInfo } from "@/lib/luxury";
import type { Product } from "@/lib/types";

type EditionBadgeProps = {
  product: Pick<
    Product,
    "limitedEdition" | "editionTotal" | "editionSold" | "piecesRemaining"
  >;
  className?: string;
};

export function EditionBadge({ product, className = "" }: EditionBadgeProps) {
  const edition = getEditionInfo(product);
  if (!edition) return null;

  const progress =
    edition.total > 0
      ? Math.min(100, Math.round((edition.sold / edition.total) * 100))
      : 0;

  return (
    <div
      className={`rounded-lg border border-[#E8E4DC] bg-[#FDFCF8] px-3 py-2.5 ${className}`}
      aria-label={`Limited edition ${edition.label}`}
    >
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0]">
          Exclusive edition
        </span>
        <span className="font-display text-sm font-bold text-[#2B2B2B] tracking-wide">
          {edition.label}
        </span>
      </div>
      <div
        className="h-1 w-full rounded-full bg-[#E8E4DC] overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Edition sold progress"
      >
        <div
          className="h-full bg-[#2B2B2B] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1.5 font-sans text-[10px] text-[#7A7A7A]">
        {edition.remaining} of {edition.total} remaining
      </p>
    </div>
  );
}
