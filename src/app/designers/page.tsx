"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { DesignerHouseCard } from "@/components/designer/DesignerHouseCard";
import { DESIGNERS } from "@/lib/mock-data";

const CITY_FILTERS = ["All", "Delhi", "Mumbai", "Jaipur", "Kolkata", "Bengaluru"];

export default function DesignersDirectoryPage() {
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  useEffect(() => {
    let url = "/api/designers";
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCity !== "All") params.set("city", selectedCity);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok) {
          if (Array.isArray(body.data)) {
            setHouses(body.data);
          } else if (Array.isArray(body.data?.items)) {
            setHouses(body.data.items);
          } else {
            setHouses(DESIGNERS as any[]);
          }
        } else {
          setHouses(DESIGNERS as any[]);
        }
      })
      .catch(() => setHouses(DESIGNERS as any[]))
      .finally(() => setLoading(false));
  }, [searchQuery, selectedCity]);

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-28 max-w-5xl mx-auto px-4 pt-6 space-y-6 bg-paper">
        {/* Header Title & Subtitle */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone block">Designer Directory</span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-charcoal">
            THE ATELIERS
          </h1>
          <p className="text-xs text-stone leading-relaxed">
            Discover independent luxury designer houses, master artisans, and couture labels crafting India&apos;s finest fashion.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ateliers by name, city (e.g. Jaipur), or technique..."
            className="w-full rounded-2xl border border-cloud bg-white px-5 py-3.5 text-xs outline-none shadow-xs font-medium focus:ring-2 focus:ring-charcoal/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-3.5 text-xs text-stone font-bold hover:text-charcoal"
            >
              ✕
            </button>
          )}
        </div>

        {/* City Filter Chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {CITY_FILTERS.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-colors border ${
                selectedCity === city
                  ? "bg-charcoal text-paper border-charcoal shadow-xs"
                  : "bg-white text-stone border-cloud hover:border-stone"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Designer Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-stone animate-pulse font-bold">
            Loading atelier houses…
          </div>
        ) : houses.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-cloud text-center space-y-3 shadow-xs">
            <span className="text-3xl block">🏛️</span>
            <p className="text-sm font-bold text-charcoal">No Designer Houses Found</p>
            <p className="text-xs text-stone">Try clearing search filters or searching for another location.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCity("All");
              }}
              className="px-5 py-2 bg-charcoal text-paper text-xs font-bold uppercase rounded-full"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {houses.map((house) => (
              <DesignerHouseCard key={house.id || house.handle} house={house} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
