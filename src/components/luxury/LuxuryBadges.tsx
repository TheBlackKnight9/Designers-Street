"use client";

import {
  resolveLuxuryBadges,
  type ProductBadgeSource,
} from "@/lib/luxury";

type LuxuryBadgesProps = {
  product: ProductBadgeSource;
  designerVerified?: boolean;
  className?: string;
  max?: number;
};

export function LuxuryBadges({
  product,
  designerVerified,
  className = "",
  max = 4,
}: LuxuryBadgesProps) {
  const badges = resolveLuxuryBadges(product, designerVerified).slice(0, max);
  if (!badges.length) return null;

  return (
    <ul
      className={`flex flex-wrap gap-1.5 ${className}`}
      aria-label="Product badges"
    >
      {badges.map((b) => (
        <li
          key={b.id}
          className="px-2.5 py-1 border border-[#E0E0E0] bg-[#FAFAFA] font-sans text-[9px] font-bold uppercase tracking-wider text-[#4A4A4A]"
        >
          {b.label}
        </li>
      ))}
    </ul>
  );
}
