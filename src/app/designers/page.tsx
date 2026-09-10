"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { DesignerHouseCard } from "@/components/designer/DesignerHouseCard";
import { DESIGNERS } from "@/lib/mock-data";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { getIndianStates } from "@/lib/data/india-locations";

const CITY_FILTERS = ["All", "Delhi", "Mumbai", "Jaipur", "Kolkata", "Bengaluru"];

export default function DesignersDirectoryPage() {
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedState, setSelectedState] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const indianStates = getIndianStates();

  useEffect(() => {
    let url = "/api/designers";
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCity !== "All") params.set("city", selectedCity);
    if (selectedState) params.set("state", selectedState);
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
  }, [searchQuery, selectedCity, selectedState]);

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-28 max-w-5xl mx-auto px-4 pt-[96px] space-y-5">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-1.5 pb-2">
          <span className="editorial-eyebrow">The Guild of Artisans</span>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-stone-950 tracking-tight">
            Designer Houses
          </h1>
          <p className="text-xs text-stone-500 font-normal max-w-md mx-auto leading-relaxed">
            Discover celebrated ateliers, master weavers, and independent couture creators across India.
          </p>
        </div>

        {/* Compact search bar + city chips in single row */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--stone)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search designers, techniques..."
                className="w-full rounded-full border border-[var(--border-default)] bg-white pl-10 pr-8 py-2.5 text-xs outline-none font-medium focus:border-[#FF6B00] focus:ring-1 focus:ring-orange-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-[var(--stone)]" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border text-xs font-medium transition-all ${
                showFilters || selectedState
                  ? "bg-[#FF6B00] border-[#FF6B00] text-white shadow-sm shadow-orange-500/20"
                  : "bg-white border-[var(--border-default)] text-[var(--charcoal)] hover:border-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          {/* City chips — horizontal scroll, always visible */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {CITY_FILTERS.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelectedCity(city);
                  setSelectedState("");
                }}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-[0.06em] transition-colors ${
                  selectedCity === city && !selectedState ? "ds-chip-active" : "ds-chip"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Expandable filter panel */}
          {showFilters && (
            <div className="bg-white border border-[var(--border-default)] rounded-lg p-4 space-y-3 animate-fade-in">
              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--stone)] mb-1 block">State / UT</span>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-white px-3 py-2 text-xs font-medium outline-none text-[var(--charcoal)] cursor-pointer focus:border-[var(--charcoal)]"
                >
                  <option value="">All States &amp; UTs</option>
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        {/* Designer Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[var(--stone)] animate-pulse font-medium">
            Loading atelier houses…
          </div>
        ) : houses.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[var(--border-default)] text-center space-y-3">
            <span className="text-3xl block">🏛️</span>
            <p className="text-sm font-semibold text-[var(--charcoal)]">No Designer Houses Found</p>
            <p className="text-xs text-[var(--stone)]">Try clearing search filters or searching for another location.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCity("All");
                setSelectedState("");
              }}
              className="px-5 py-2 bg-[var(--charcoal)] text-white text-xs font-medium uppercase tracking-[0.08em] rounded-lg"
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
