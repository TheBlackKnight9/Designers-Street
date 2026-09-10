"use client";

import { MessageSquare, ShoppingBag } from "lucide-react";

type ProductStickyActionsProps = {
  isConcept?: boolean;
  conceptLabel?: string;
  inBag: boolean;
  bagQty: number;
  error?: string;
  onAddToBag: () => void;
  onBuyNow: () => void;
  onConcept?: () => void;
  onInquiry?: () => void;
};

/**
 * Mobile bottom action bar matching reference design:
 * [ Chat Circle ] [ Add to Cart Pill ] [ Buy Now Pill (Green) ]
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
  onInquiry,
}: ProductStickyActionsProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--border-subtle)] px-4 pt-3 pb-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {error && (
        <p className="mb-2 font-sans text-[11px] font-medium text-[var(--accent-hot)] text-center">
          {error}
        </p>
      )}

      {isConcept ? (
        <button
          type="button"
          onClick={onConcept}
          className="flex h-12 w-full items-center justify-center rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white font-sans text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition-all shadow-md shadow-orange-500/25"
        >
          {conceptLabel}
        </button>
      ) : (
        <div className="flex items-center gap-2.5">
          {/* Chat / Inquiry circular icon button */}
          <button
            type="button"
            onClick={onInquiry ?? onConcept}
            className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[var(--charcoal)] active:scale-95 transition-transform flex-shrink-0 hover:bg-gray-50 shadow-xs"
            aria-label="Inquire with atelier"
          >
            <MessageSquare className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Add to Cart pill button */}
          <button
            type="button"
            onClick={onAddToBag}
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] bg-white font-sans text-xs font-bold active:scale-[0.98] transition-all hover:bg-[#FF6B00]/5"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2]" />
            <span>{inBag ? `In Cart (${bagQty})` : "Add to Cart"}</span>
          </button>

          {/* Buy Now solid luxury orange pill button */}
          <button
            type="button"
            onClick={onBuyNow}
            className="flex-1 h-12 flex items-center justify-center rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white font-sans text-xs font-bold active:scale-[0.98] transition-all shadow-md shadow-orange-500/25"
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
}
