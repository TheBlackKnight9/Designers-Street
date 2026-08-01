"use client";

import { getScarcitySignals } from "@/lib/luxury";
import type { Product } from "@/lib/types";

type ScarcityStripProps = {
  product: Pick<
    Product,
    | "piecesRemaining"
    | "limitedEdition"
    | "recentPurchaseCount"
    | "editionTotal"
    | "editionSold"
  >;
  className?: string;
};

export function ScarcityStrip({ product, className = "" }: ScarcityStripProps) {
  const signals = getScarcitySignals(product).filter(
    (s) => s.kind !== "limited_release"
  );
  if (!signals.length) return null;

  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`}
      aria-live="polite"
    >
      {signals.slice(0, 3).map((s) => (
        <span
          key={s.kind}
          className={`font-sans text-[10px] font-bold uppercase tracking-wider ${
            s.kind === "sold_out" || s.kind === "almost_sold_out"
              ? "text-[#8B3A3A]"
              : "text-[#5C5346]"
          }`}
        >
          {s.label}
        </span>
      ))}
    </div>
  );
}
