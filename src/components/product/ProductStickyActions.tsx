"use client";

import { useEffect, useState } from "react";

type ProductStickyActionsProps = {
  isConcept?: boolean;
  conceptLabel?: string;
  inBag: boolean;
  bagQty: number;
  error?: string;
  onAddToBag: () => void;
  onBuyNow: () => void;
  onConcept?: () => void;
};

/**
 * Floating commerce pill — sticks under the fixed app header so Add to Cart / Buy
 * stay primary and visible while scrolling the product page.
 */
export function ProductStickyActions({
  isConcept,
  conceptLabel = "Request Quote",
  inBag,
  bagQty,
  error,
  onAddToBag,
  onBuyNow,
  onConcept,
}: ProductStickyActionsProps) {
  const [topOffset, setTopOffset] = useState(0);

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector("header");
      const appBanner = document.querySelector('[class*="z-[60]"]');
      let top = 0;
      if (header) top = Math.max(top, header.getBoundingClientRect().bottom);
      if (appBanner) top = Math.max(top, appBanner.getBoundingClientRect().bottom);
      // If nothing measured yet (hydration), fall back under typical chrome
      setTopOffset(top > 0 ? top : 120);
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    const id = window.setInterval(measure, 800);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      window.clearInterval(id);
    };
  }, []);

  return (
    <div
      className="sticky z-40 -mx-4 mb-3 px-4 pt-2 pb-2 bg-paper/95 backdrop-blur-md border-b border-cloud/60"
      style={{ top: topOffset }}
    >
      <div className="rounded-full bg-espresso p-1.5 shadow-[0_10px_32px_rgba(42,31,24,0.35)]">
        {isConcept ? (
          <button
            type="button"
            onClick={onConcept}
            className="flex h-12 w-full items-center justify-center rounded-full bg-bronze text-[#1A120C] font-sans text-xs font-extrabold uppercase tracking-wider active:scale-[0.98] transition-transform"
          >
            {conceptLabel}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onAddToBag}
              className="flex h-12 items-center justify-center rounded-full bg-white/10 text-chip font-sans text-[11px] font-extrabold uppercase tracking-wider active:scale-[0.98] transition-transform hover:bg-white/15"
            >
              {inBag ? `In Bag${bagQty > 1 ? ` · ${bagQty}` : ""} ✓` : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              className="flex h-12 items-center justify-center rounded-full bg-bronze text-[#1A120C] font-sans text-[11px] font-extrabold uppercase tracking-wider active:scale-[0.98] transition-transform"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-2 px-2 font-sans text-[11px] font-semibold text-[var(--accent-hot)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
