"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { ProductCard } from "@/components/ui/ProductCard";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import { PRODUCTS } from "@/lib/mock-data";
import { useStorefrontProducts } from "@/hooks/useStorefrontCatalog";

type SortOption = "default" | "price-low-high" | "price-high-low" | "customer-rating";
type QuickFilterOption = "all" | "fast-delivery" | "best-seller" | "lowest-price" | "limited-edition";

export default function StorePage() {
  const catalog = useStorefrontProducts({ limit: 100, filters: { sort: "newest" } });
  const products = catalog.enabled ? catalog.products : PRODUCTS;

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilterOption>("all");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  const processedProducts = useMemo(() => {
    let result = [...products];

    if (quickFilter === "fast-delivery") {
      result = result.filter((p) => p.deliveryText && p.deliveryText.includes("48 hours"));
    } else if (quickFilter === "best-seller") {
      result = result.filter((p) => (p.rating ?? 0) >= 4.9);
    } else if (quickFilter === "lowest-price") {
      result = result.filter((p) => p.price <= 80000);
    } else if (quickFilter === "limited-edition") {
      result = result.filter((p) => p.limitedEdition);
    }

    if (selectedSize !== "all") {
      result = result.filter((p) => p.sizes.includes(selectedSize));
    }

    if (sortBy === "price-low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high-low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "customer-rating") {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return result;
  }, [products, sortBy, selectedSize, quickFilter]);

  const uniqueSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => sizes.add(s)));
    return Array.from(sizes);
  }, [products]);

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-28 bg-transparent">
        <header className="px-5 pt-8 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone mb-2">
            The Atelier
          </p>
          <h1 className="font-sans text-[1.75rem] font-extrabold text-charcoal tracking-tight leading-none">
            Shop
          </h1>
          <p className="mt-2 text-[13px] text-stone leading-relaxed max-w-sm">
            Limited editions and ready-to-wear from India&apos;s most celebrated houses.
          </p>
        </header>

        {/* Refined controls */}
        <div className="sticky top-[var(--top-bar-height)] z-30 bg-canvas/90 backdrop-blur-md border-y border-[var(--border-subtle)]">
          <div className="flex items-center divide-x divide-[#ECEAE4]">
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowSizeDropdown(false);
                }}
                className="w-full py-3.5 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-charcoal"
              >
                Sort
                <span className="text-[9px] text-stone">▾</span>
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-3 w-48 bg-paper border border-[#ECEAE4] rounded-2xl shadow-xl py-2 z-40 overflow-hidden">
                  {(
                    [
                      { value: "default", label: "Featured" },
                      { value: "price-low-high", label: "Price · Low to High" },
                      { value: "price-high-low", label: "Price · High to Low" },
                      { value: "customer-rating", label: "Highest Rated" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-[12px] ${
                        sortBy === opt.value
                          ? "bg-charcoal text-paper font-semibold"
                          : "text-stone hover:bg-mist"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => {
                  setShowSizeDropdown(!showSizeDropdown);
                  setShowSortDropdown(false);
                }}
                className="w-full py-3.5 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-charcoal"
              >
                Size
                <span className="text-[9px] text-stone">▾</span>
              </button>
              {showSizeDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-36 bg-paper border border-[#ECEAE4] rounded-2xl shadow-xl py-2 z-40 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSize("all");
                      setShowSizeDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-[12px] ${
                      selectedSize === "all" ? "bg-charcoal text-paper font-semibold" : "text-stone"
                    }`}
                  >
                    All
                  </button>
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setShowSizeDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-[12px] ${
                        selectedSize === size ? "bg-charcoal text-paper font-semibold" : "text-stone"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSortBy("default");
                setSelectedSize("all");
                setQuickFilter("all");
                setShowSortDropdown(false);
                setShowSizeDropdown(false);
              }}
              className="flex-1 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone hover:text-charcoal"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="px-5 py-4 flex gap-2 overflow-x-auto hide-scrollbar">
          <Link
            href="/designers"
            className="flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] ds-chip-feature"
          >
            Houses
          </Link>
          {[
            { id: "all", label: "All" },
            { id: "limited-edition", label: "Limited" },
            { id: "best-seller", label: "Bestsellers" },
            { id: "fast-delivery", label: "Express" },
            { id: "lowest-price", label: "Under 80K" },
          ].map((item) => {
            const active = quickFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setQuickFilter(item.id as QuickFilterOption)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  active ? "ds-chip-active" : "ds-chip"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-3 flex items-baseline justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
            {processedProducts.length} pieces
          </p>
        </div>

        {catalog.enabled && (catalog.loading || catalog.error) ? (
          <CatalogStatus loading={catalog.loading} error={catalog.error} onRetry={catalog.reload} />
        ) : processedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 px-4 pb-8">
            {processedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-24 text-center">
            <p className="text-sm text-stone mb-3">No pieces match these filters.</p>
            <button
              type="button"
              onClick={() => {
                setSortBy("default");
                setSelectedSize("all");
                setQuickFilter("all");
              }}
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-charcoal underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        )}
      </main>
    </>
  );
}
