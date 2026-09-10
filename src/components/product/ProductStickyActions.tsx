"use client";

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
 * Luxury bottom-docked purchase bar — pins to the thumb zone at the bottom
 * of the mobile viewport for easy one-handed commerce. Hides on desktop
 * where the inline CTA is visible in the right column.
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
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--border-default)] px-4 pt-3 shadow-[0_-2px_16px_rgba(0,0,0,0.06)] md:hidden"
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
          className="flex h-12 w-full items-center justify-center rounded-lg bg-[var(--charcoal)] text-white font-sans text-[12px] font-semibold uppercase tracking-[0.1em] active:scale-[0.98] transition-transform"
        >
          {conceptLabel}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onAddToBag}
            className="flex h-12 items-center justify-center rounded-lg border border-[var(--charcoal)] text-[var(--charcoal)] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] active:scale-[0.98] transition-transform hover:bg-[var(--mist)]"
          >
            {inBag ? `In Bag${bagQty > 1 ? ` · ${bagQty}` : ""} ✓` : "Add to Bag"}
          </button>
          <button
            type="button"
            onClick={onBuyNow}
            className="flex h-12 items-center justify-center rounded-lg bg-[var(--charcoal)] text-white font-sans text-[12px] font-semibold uppercase tracking-[0.08em] active:scale-[0.98] transition-transform"
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
}
