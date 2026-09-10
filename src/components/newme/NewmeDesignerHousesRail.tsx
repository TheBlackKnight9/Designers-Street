"use client";

import Image from "next/image";
import Link from "next/link";
import type { DesignerHouse } from "@/lib/types";

type NewmeDesignerHousesRailProps = {
  designers: DesignerHouse[];
};

/** Generate a two-letter monogram from a designer name */
function monogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function NewmeDesignerHousesRail({ designers }: NewmeDesignerHousesRailProps) {
  const houses = designers.slice(0, 10);
  if (!houses.length) return null;

  return (
    <section className="py-6 border-y border-[var(--border-subtle)] bg-white">
      <div className="flex items-end justify-between px-4 mb-3.5">
        <div>
          <span className="editorial-eyebrow block mb-0.5">The Couturiers</span>
          <h2 className="font-serif text-xl md:text-2xl font-normal text-stone-950 tracking-tight leading-none">
            Designer Houses
          </h2>
        </div>
        <Link href="/designers" className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400 hover:text-stone-900 transition-colors pb-0.5">
          View All →
        </Link>
      </div>

      <div className="flex gap-3.5 px-4 overflow-x-auto hide-scrollbar pb-1">
        {houses.map((house) => (
          <Link
            key={house.id}
            href={`/designer/${house.handle}`}
            className="flex-shrink-0 w-[72px] flex flex-col items-center gap-1.5 group"
          >
            <div className="relative w-15 h-15 rounded-full overflow-hidden border border-[var(--border-default)] bg-[#F5F6F8] group-hover:border-[#FF6B00] group-hover:ring-2 group-hover:ring-orange-500/20 transition-all shadow-2xs">
              {house.logo ? (
                <Image
                  src={house.logo}
                  alt={house.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="60px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-xs font-semibold tracking-wider text-stone-900 bg-[#F5F6F8]">
                  {monogram(house.name)}
                </div>
              )}
            </div>
            <span className="font-serif text-[11px] font-medium text-stone-800 text-center leading-tight line-clamp-1 w-full group-hover:text-[#FF6B00] transition-colors">
              {house.name.split(" ")[0]}
            </span>
          </Link>
        ))}
        <Link
          href="/designers"
          className="flex-shrink-0 w-[68px] flex flex-col items-center gap-1.5"
        >
          <div className="w-14 h-14 rounded-full border border-dashed border-[var(--border-default)] bg-white flex items-center justify-center text-[9px] font-medium uppercase text-[var(--stone)] tracking-wider">
            All
          </div>
          <span className="text-[9px] font-medium text-[var(--stone)]">Houses</span>
        </Link>
      </div>
    </section>
  );
}
