"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import type { DesignerHouse, Product } from "@/lib/types";
import { getDesignerUrl } from "@/lib/routes";

type DesignerSpotlightProps = {
  designer: DesignerHouse;
  products: Product[];
  className?: string;
};

export function DesignerSpotlight({
  designer,
  products,
  className = "",
}: DesignerSpotlightProps) {
  const shelf = products.slice(0, 4);

  return (
    <section className={`bg-[#F9F7F2] border-y border-[#E8E4DC] py-6 px-4 ${className}`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059]">
            House Spotlight
          </span>
          <h2 className="font-display text-xl font-bold uppercase text-[#2B2B2B] tracking-tight">
            {designer.name}
          </h2>
        </div>
        <Link
          href={getDesignerUrl(designer.handle) ?? "/store"}
          className="px-4 py-2 border border-[#2B2B2B] text-[#2B2B2B] font-sans text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-[#2B2B2B] hover:text-white transition-colors"
        >
          View House
        </Link>
      </div>

      {/* Narrative Card */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-[#E8E4DC] p-4 mb-5 shadow-2xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#E0E0E0] bg-[#2B2B2B] flex-shrink-0">
            <Image src={designer.logo} alt={designer.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-sans text-xs font-bold uppercase text-[#2B2B2B]">
              Atelier Notes
            </h3>
            <p className="font-sans text-[10px] text-[#7A7A7A]">
              {designer.studioLocation || designer.location}
              {designer.yearsExperience ? ` · ${designer.yearsExperience} yrs experience` : ""}
            </p>
          </div>
        </div>
        <p className="font-sans text-xs text-[#4A4A4A] italic leading-relaxed">
          &ldquo;{designer.designPhilosophy || designer.bio}&rdquo;
        </p>
      </div>

      {/* Curated Product Shelf */}
      {shelf.length > 0 && (
        <div>
          <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] mb-3">
            Signature House Pieces
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {shelf.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
