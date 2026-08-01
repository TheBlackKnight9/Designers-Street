"use client";

import Link from "next/link";
import Image from "next/image";

function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

export function DesignerHouseCard({ house }: { house: any }) {
  const name = house.name || "Designer House";
  const handle = house.handle || "designer";
  const location = house.location || "India";
  const bio = house.bio || house.foundingStory || "";
  const techniques = house.signatureTechniques || [];
  const productCount = house._count?.products || house.products?.length || 0;

  return (
    <Link
      href={`/designer/${handle}`}
      className="group block rounded-3xl border border-cloud bg-white overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
    >
      {/* Banner */}
      <div className="relative h-32 w-full bg-mist overflow-hidden">
        {isValidImageUrl(house.banner) ? (
          <Image
            src={house.banner}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-stone to-charcoal/90" />
        )}
      </div>

      {/* Logo & Info */}
      <div className="relative px-5 pb-5 pt-0">
        <div className="relative -mt-10 mb-3 flex items-end justify-between">
          <div className="relative h-16 w-16 rounded-2xl border-4 border-white bg-charcoal overflow-hidden shadow-md shrink-0 flex items-center justify-center font-bold text-paper text-lg">
            {isValidImageUrl(house.logo) ? (
              <Image src={house.logo} alt={name} fill className="object-cover" sizes="64px" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-mist text-stone border border-cloud">
            📍 {location}
          </span>
        </div>

        <h3 className="font-display text-lg font-bold text-charcoal group-hover:text-gold transition-colors truncate">
          {name}
        </h3>
        <p className="text-xs font-mono font-bold text-stone">@{handle}</p>

        {bio && (
          <p className="text-xs text-stone leading-relaxed line-clamp-2 mt-2 font-medium">
            {bio}
          </p>
        )}

        {/* Signature Techniques Chips */}
        {techniques.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {techniques.slice(0, 3).map((tech: string) => (
              <span
                key={tech}
                className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-mist text-charcoal border border-cloud"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-cloud flex items-center justify-between text-xs font-bold uppercase tracking-wider text-charcoal">
          <span className="group-hover:translate-x-1 transition-transform inline-block">Explore Atelier →</span>
          <span className="text-[10px] text-stone font-mono">{productCount} Pieces</span>
        </div>
      </div>
    </Link>
  );
}
