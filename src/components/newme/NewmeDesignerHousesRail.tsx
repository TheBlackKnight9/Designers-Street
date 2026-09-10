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
    <section className="py-5 border-y border-[var(--border-subtle)]">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-display text-base font-semibold text-[var(--charcoal)] tracking-wide">
          Designer Houses
        </h2>
        <Link href="/designers" className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--stone)] hover:text-[var(--charcoal)] transition-colors">
          View All
        </Link>
      </div>

      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-1">
        {houses.map((house) => (
          <Link
            key={house.id}
            href={`/designer/${house.handle}`}
            className="flex-shrink-0 w-[68px] flex flex-col items-center gap-1.5 group"
          >
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[var(--border-default)] bg-white">
              {house.logo ? (
                <Image
                  src={house.logo}
                  alt={house.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[11px] font-semibold tracking-wider text-[var(--charcoal)] bg-[var(--mist)]">
                  {monogram(house.name)}
                </div>
              )}
            </div>
            <span className="text-[9px] font-medium text-[var(--charcoal)] text-center leading-tight line-clamp-2 w-full group-hover:underline">
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
