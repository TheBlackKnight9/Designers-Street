"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { DesignerHouseCard } from "@/components/designer/DesignerHouseCard";
import { DESIGNERS } from "@/lib/mock-data";

import { getIndianStates } from "@/lib/data/india-locations";

const CITY_FILTERS = ["All", "Delhi", "Mumbai", "Jaipur", "Kolkata", "Bengaluru"];
const CATEGORY_FILTERS = ["All Categories", "Lehengas", "Sarees", "Anarkalis", "Kurtas", "Indo-Western", "Accessories"];

export default function DesignersDirectoryPage() {
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

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

        {/* Live Search & State Dropdown Row */}
        <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, technique (Zardozi, Chikankari...)"
              className="w-full rounded-2xl border border-cloud bg-white px-5 py-3 text-xs outline-none shadow-xs font-medium focus:ring-2 focus:ring-charcoal/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-3 text-xs text-stone font-bold hover:text-charcoal"
              >
                ✕
              </button>
            )}
          </div>
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full h-full rounded-2xl border border-cloud bg-white px-4 py-3 text-xs font-bold outline-none text-charcoal shadow-xs cursor-pointer"
            >
              <option value="">36 States &amp; UTs</option>
              {indianStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* City Filter Chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {CITY_FILTERS.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setSelectedCity(city);
                setSelectedState("");
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-colors ${
                selectedCity === city && !selectedState ? "ds-chip-active" : "ds-chip"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Category Chips */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 border-t border-cloud/40">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                selectedCategory === cat ? "ds-chip-active" : "ds-chip"
              }`}
            >
              {cat}
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
              className="px-5 py-2 bg-espresso text-chip text-xs font-bold uppercase rounded-full shadow-[0_2px_8px_rgba(42,31,24,0.25)]"
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
