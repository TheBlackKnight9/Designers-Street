"use client";

import Image from "next/image";
import Link from "next/link";
import type { DesignerHouse } from "@/lib/types";

type NewmeDesignerHousesRailProps = {
  designers: DesignerHouse[];
};

export function NewmeDesignerHousesRail({ designers }: NewmeDesignerHousesRailProps) {
  const houses = designers.slice(0, 10);
  if (!houses.length) return null;

  return (
    <section className="py-4 bg-mist border-y border-[var(--border-subtle)]">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-sm font-black uppercase text-charcoal">
          Designer <span className="text-[var(--newme-green-dark)]">Houses</span>
        </h2>
        <Link href="/designers" className="text-[11px] font-bold uppercase underline text-charcoal">
          View All
        </Link>
      </div>

      <div className="flex gap-2.5 px-4 overflow-x-auto hide-scrollbar pb-1">
        {houses.map((house) => (
          <Link
            key={house.id}
            href={`/designer/${house.handle}`}
            className="flex-shrink-0 w-[72px] flex flex-col items-center gap-1.5"
          >
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-charcoal bg-paper shadow-sm">
              {house.logo ? (
                <Image
                  src={house.logo}
                  alt={house.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-black text-charcoal">
                  {house.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold text-charcoal text-center leading-tight line-clamp-2 w-full">
              {house.name.split(" ")[0]}
            </span>
          </Link>
        ))}
        <Link
          href="/designers"
          className="flex-shrink-0 w-[72px] flex flex-col items-center gap-1.5"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-stone bg-paper flex items-center justify-center text-[10px] font-extrabold uppercase text-stone">
            All
          </div>
          <span className="text-[9px] font-bold text-stone">Houses</span>
        </Link>
      </div>
    </section>
  );
}
