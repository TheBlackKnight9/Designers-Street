/**
 * Phase 8 — Luxury marketplace helpers (scarcity, editions, badges, trust).
 * Pure functions — reusable across PDP, cards, reels, catalog DTOs.
 */

export type LuxuryBadgeId =
  | "verified_designer"
  | "editors_pick"
  | "limited_edition"
  | "new_arrival"
  | "handcrafted"
  | "made_to_order"
  | "sustainable"
  | "premium_collection";

export const LUXURY_BADGE_LABELS: Record<LuxuryBadgeId, string> = {
  verified_designer: "Verified Designer",
  editors_pick: "Editor's Pick",
  limited_edition: "Limited Edition",
  new_arrival: "New Arrival",
  handcrafted: "Handcrafted",
  made_to_order: "Made to Order",
  sustainable: "Sustainable",
  premium_collection: "Premium Collection",
};

export type ScarcitySignal =
  | { kind: "sold_out"; label: string }
  | { kind: "only_left"; label: string; remaining: number }
  | { kind: "almost_sold_out"; label: string; remaining: number }
  | { kind: "selling_fast"; label: string; remaining: number }
  | { kind: "limited_release"; label: string }
  | { kind: "recently_purchased"; label: string }
  | { kind: "low_stock"; label: string; remaining: number };

export type EditionInfo = {
  total: number;
  sold: number;
  /** Display like #021 / 100 (next available or last sold) */
  label: string;
  remaining: number;
};

export function formatEditionNumber(n: number): string {
  return String(Math.max(0, n)).padStart(3, "0");
}

/** Edition label for the next piece (#sold+1 / total), clamped to total. */
export function getEditionInfo(input: {
  limitedEdition?: boolean;
  editionTotal?: number | null;
  editionSold?: number | null;
  piecesRemaining?: number | null;
}): EditionInfo | null {
  if (!input.limitedEdition) return null;
  const total =
    input.editionTotal ??
    (input.piecesRemaining != null && input.editionSold != null
      ? input.editionSold + input.piecesRemaining
      : input.piecesRemaining ?? null);
  if (total == null || total <= 0) return null;
  const sold = Math.max(0, input.editionSold ?? 0);
  const remaining =
    input.piecesRemaining != null
      ? Math.max(0, input.piecesRemaining)
      : Math.max(0, total - sold);
  const next = Math.min(total, sold + 1);
  return {
    total,
    sold,
    remaining,
    label: `#${formatEditionNumber(next)} / ${total}`,
  };
}

export function getScarcitySignals(input: {
  piecesRemaining?: number | null;
  limitedEdition?: boolean;
  recentPurchaseCount?: number | null;
  editionTotal?: number | null;
  editionSold?: number | null;
}): ScarcitySignal[] {
  const signals: ScarcitySignal[] = [];
  const remaining = input.piecesRemaining;

  if (remaining != null && remaining <= 0) {
    signals.push({ kind: "sold_out", label: "Sold Out" });
    return signals;
  }

  if (remaining != null && remaining <= 2) {
    signals.push({
      kind: "only_left",
      label: `Only ${remaining} Left`,
      remaining,
    });
    signals.push({
      kind: "almost_sold_out",
      label: "Almost Sold Out",
      remaining,
    });
  } else if (remaining != null && remaining <= 5) {
    signals.push({
      kind: "selling_fast",
      label: "Selling Fast",
      remaining,
    });
  } else if (remaining != null && remaining <= 8) {
    signals.push({
      kind: "low_stock",
      label: `Only ${remaining} left`,
      remaining,
    });
  }

  if (input.limitedEdition) {
    signals.push({ kind: "limited_release", label: "Limited Release" });
  }

  if ((input.recentPurchaseCount ?? 0) >= 3) {
    signals.push({
      kind: "recently_purchased",
      label: "Recently Purchased",
    });
  }

  return signals;
}

export type ProductBadgeSource = {
  verified?: boolean;
  limitedEdition?: boolean;
  editorsPick?: boolean;
  handcrafted?: boolean;
  madeToOrder?: boolean;
  sustainable?: boolean;
  badges?: string[];
  tags?: string[];
  createdAt?: string | Date | null;
};

export function resolveLuxuryBadges(
  product: ProductBadgeSource,
  designerVerified?: boolean
): { id: LuxuryBadgeId; label: string }[] {
  const out: { id: LuxuryBadgeId; label: string }[] = [];
  const add = (id: LuxuryBadgeId) => {
    if (!out.some((b) => b.id === id)) {
      out.push({ id, label: LUXURY_BADGE_LABELS[id] });
    }
  };

  if (product.verified || designerVerified) add("verified_designer");
  if (product.editorsPick || product.badges?.includes("editors_pick")) {
    add("editors_pick");
  }
  if (product.limitedEdition) add("limited_edition");
  if (product.handcrafted || product.badges?.includes("handcrafted")) {
    add("handcrafted");
  }
  if (product.madeToOrder || product.badges?.includes("made_to_order")) {
    add("made_to_order");
  }
  if (product.sustainable || product.badges?.includes("sustainable")) {
    add("sustainable");
  }
  if (
    product.badges?.includes("premium_collection") ||
    product.tags?.some((t) => /premium|couture/i.test(t))
  ) {
    add("premium_collection");
  }

  if (product.createdAt) {
    const created = new Date(product.createdAt).getTime();
    if (
      Number.isFinite(created) &&
      Date.now() - created < 1000 * 60 * 60 * 24 * 45
    ) {
      add("new_arrival");
    }
  } else if (product.badges?.includes("new_arrival")) {
    add("new_arrival");
  }

  return out;
}

export const TRUST_SIGNALS = [
  { id: "authentic", label: "Authenticity guarantee" },
  { id: "packaging", label: "Premium packaging" },
  { id: "secure", label: "Secure checkout" },
  { id: "returns", label: "Easy returns" },
  { id: "handcrafted", label: "Crafted by hand" },
  { id: "verified", label: "Verified designer" },
] as const;
