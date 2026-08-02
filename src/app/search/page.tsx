"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { sanitizeImageUrl } from "@/lib/utils/image-url";

type AutocompleteData = {
  products: Array<{ id: string; name: string; price: number; category: string }>;
  designerHouses: Array<{ id: string; name: string; handle: string; logo: string }>;
  categories: Array<{ id: string; label: string; slug: string }>;
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [autocomplete, setAutocomplete] = useState<AutocompleteData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Filters
  const [listingType, setListingType] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("");
  const [designerId, setDesignerId] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [selectedColor, setSelectedColor] = useState<string>("");

  const [products, setProducts] = useState<any[]>([]);
  const [designersList, setDesignersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Autocomplete fetch on query change
  useEffect(() => {
    if (query.trim().length >= 2) {
      fetch(`/api/search/autocomplete?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((res) => {
          if (res?.ok) {
            setAutocomplete(res.data);
            setShowDropdown(true);
          }
        })
        .catch(() => {});
    } else {
      setShowDropdown(false);
    }
  }, [query]);

  // Fetch designers directory for filter options
  useEffect(() => {
    fetch("/api/designers")
      .then((r) => r.json())
      .then((res) => {
        if (res?.ok && Array.isArray(res.data?.designers)) {
          setDesignersList(res.data.designers);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch search results
  async function performSearch() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (listingType !== "ALL") params.set("listingType", listingType);
      if (category) params.set("category", category);
      if (designerId) params.set("designerId", designerId);
      if (size) params.set("size", size);
      if (sort) params.set("sort", sort);
      if (maxPrice < 500000) params.set("maxPrice", String(maxPrice));
      if (selectedColor) params.set("color", selectedColor);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (data?.ok) {
        let filtered = data.data.products || [];
        if (maxPrice < 500000) {
          filtered = filtered.filter((p: any) => p.price <= maxPrice);
        }
        if (selectedColor) {
          filtered = filtered.filter((p: any) =>
            p.colors?.some((c: string) => c.toLowerCase().includes(selectedColor.toLowerCase()))
          );
        }
        setProducts(filtered);
      }
    } catch {
      /* error */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    performSearch();
  }, [listingType, category, designerId, size, sort, maxPrice, selectedColor]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowDropdown(false);
    performSearch();
  }

  return (
    <div className="space-y-6">
      {/* Search Header Bar with Autocomplete */}
      <div className="relative max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
            placeholder="Search Lehengas, Sarees, Couturiers or Ateliers..."
            className="w-full rounded-full border border-cloud bg-white px-6 py-4 pr-12 text-sm shadow-xs outline-none focus:ring-2 focus:ring-charcoal/20"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-charcoal text-paper rounded-full text-xs font-bold"
          >
            🔍
          </button>
        </form>

        {/* Live Autocomplete Suggestions Dropdown */}
        {showDropdown && autocomplete && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-cloud shadow-xl z-50 p-4 space-y-3">
            {autocomplete.designerHouses.length > 0 && (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone block mb-1.5">Atelier Designer Houses</span>
                <div className="flex flex-wrap gap-2">
                  {autocomplete.designerHouses.map((d) => (
                    <Link
                      key={d.id}
                      href={`/designer/${d.handle}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 p-1.5 pr-3 bg-mist rounded-full border border-cloud hover:bg-cloud"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sanitizeImageUrl(d.logo)} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-xs font-bold text-charcoal">{d.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {autocomplete.products.length > 0 && (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone block mb-1.5">Suggested Products</span>
                <div className="space-y-1">
                  {autocomplete.products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-mist text-xs"
                    >
                      <span className="font-bold text-charcoal">{p.name}</span>
                      <span className="text-stone font-mono">₹{p.price.toLocaleString("en-IN")}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Faceted Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-cloud space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cloud pb-3">
          {/* Listing Type Filter */}
          <div className="flex gap-1.5">
            {[
              { key: "ALL", label: "All Items" },
              { key: "COMMERCIAL", label: "Ready to Buy (Commercial)" },
              { key: "CONCEPT_ART", label: "🎨 Concept Art & Prototypes" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setListingType(t.key)}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase rounded-full transition-colors ${
                  listingType === t.key
                    ? "bg-charcoal text-paper"
                    : "bg-mist text-stone hover:bg-cloud"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-cloud bg-mist px-4 py-2 text-xs font-bold text-charcoal outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* Categories, Size & Designer Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-stone block mb-1">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-cloud bg-mist p-2.5 outline-none font-medium"
            >
              <option value="">All Categories</option>
              <option value="Lehengas">Lehengas</option>
              <option value="Sarees">Sarees</option>
              <option value="Kurtas">Kurtas</option>
              <option value="Anarkalis">Anarkalis</option>
              <option value="Indo-Western">Indo-Western</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-stone block mb-1">Designer House</span>
            <select
              value={designerId}
              onChange={(e) => setDesignerId(e.target.value)}
              className="w-full rounded-xl border border-cloud bg-mist p-2.5 outline-none font-medium"
            >
              <option value="">All Ateliers</option>
              {designersList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-stone block mb-1">Available Size</span>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full rounded-xl border border-cloud bg-mist p-2.5 outline-none font-medium"
            >
              <option value="">All Sizes</option>
              {["XS", "S", "M", "L", "XL", "Custom"].map((s) => (
                <option key={s} value={s}>
                  Size {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setListingType("ALL");
                setCategory("");
                setDesignerId("");
                setSize("");
                setSort("newest");
                setMaxPrice(500000);
                setSelectedColor("");
              }}
              className="w-full py-2.5 border border-cloud rounded-xl text-stone hover:bg-mist font-bold uppercase text-[10px]"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Price Range Slider & Color Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-cloud/60 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase text-stone">Max Price Range</span>
              <span className="font-mono font-bold text-charcoal text-xs">
                {maxPrice >= 500000 ? "Any Price" : `Under ₹${maxPrice.toLocaleString("en-IN")}`}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-charcoal cursor-pointer"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-stone block mb-1">Color Palette</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { name: "Red", bg: "#DC2626" },
                { name: "Gold", bg: "#D97706" },
                { name: "Maroon", bg: "#800000" },
                { name: "Emerald", bg: "#047857" },
                { name: "Navy", bg: "#1E3A8A" },
                { name: "Pink", bg: "#EC4899" },
                { name: "Black", bg: "#18181B" },
              ].map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(selectedColor === c.name ? "" : c.name)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    selectedColor === c.name
                      ? "border-charcoal bg-charcoal text-white"
                      : "border-cloud bg-mist text-stone hover:bg-cloud"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-white/50" style={{ backgroundColor: c.bg }} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="h-64 bg-mist rounded-3xl animate-pulse" />
          <div className="h-64 bg-mist rounded-3xl animate-pulse" />
          <div className="h-64 bg-mist rounded-3xl animate-pulse" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-cloud text-center space-y-2">
          <p className="font-display text-lg font-bold text-charcoal uppercase">No matching luxury creations found</p>
          <p className="text-xs text-stone">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-stone font-mono mb-3">Showing {products.length} luxury creations</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-28 max-w-6xl mx-auto px-4 pt-6">
        <Suspense fallback={<div className="p-8 text-center text-xs text-stone animate-pulse">Loading search...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}
