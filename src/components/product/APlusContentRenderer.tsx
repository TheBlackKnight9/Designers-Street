"use client";

import Image from "next/image";
import type { APlusModule } from "@/components/dashboard/APlusContentEditor";

export function APlusContentRenderer({ modules }: { modules?: APlusModule[] | null }) {
  if (!modules || !Array.isArray(modules) || modules.length === 0) return null;

  return (
    <div className="space-y-8 my-12 pt-8 border-t border-cloud max-w-4xl mx-auto px-4">
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone">Atelier Craftsmanship</span>
        <h2 className="font-display text-xl font-bold uppercase text-charcoal">Design &amp; Artisanal Details</h2>
      </div>

      {modules.map((mod, i) => {
        if (mod.type === "BRAND_STORY") {
          return (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white p-6 rounded-3xl border border-cloud shadow-xs">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-mist">
                <Image src={mod.image} alt={mod.title} fill className="object-cover" sizes="400px" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-base font-bold uppercase text-charcoal">{mod.title}</h3>
                <p className="text-xs text-stone leading-relaxed">{mod.description}</p>
              </div>
            </div>
          );
        }

        if (mod.type === "FULL_BANNER_QUOTE") {
          return (
            <div key={i} className="relative rounded-3xl overflow-hidden aspect-[16/7] bg-charcoal flex items-center justify-center p-6 text-center text-paper">
              <Image src={mod.image} alt="Quote Banner" fill className="object-cover opacity-40" sizes="800px" />
              <div className="relative z-10 max-w-lg space-y-2">
                <p className="font-display text-base font-medium italic">&ldquo;{mod.quote}&rdquo;</p>
                {mod.author && <p className="text-[10px] uppercase font-bold tracking-wider text-stone">— {mod.author}</p>}
              </div>
            </div>
          );
        }

        if (mod.type === "THREE_IMAGE_GRID") {
          return (
            <div key={i} className="grid grid-cols-3 gap-3">
              {mod.images.map((img, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-mist border border-cloud">
                    <Image src={img} alt="" fill className="object-cover" sizes="250px" />
                  </div>
                  {mod.titles[idx] && <p className="text-[10px] font-bold uppercase text-stone text-center">{mod.titles[idx]}</p>}
                </div>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
