"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import { PRODUCTS } from "@/lib/mock-data";
import { useCart } from "@/context/CartContext";
import { useStorefrontProducts } from "@/hooks/useStorefrontCatalog";

type SortOption = "default" | "price-low-high" | "price-high-low" | "customer-rating";
type QuickFilterOption = "all" | "fast-delivery" | "best-seller" | "lowest-price" | "limited-edition";

export default function StorePage() {
  const catalog = useStorefrontProducts({ limit: 100, filters: { sort: "newest" } });
  const products = catalog.enabled ? catalog.products : PRODUCTS;
  const { itemCount } = useCart();

  // States
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilterOption>("all");

  // Dropdown UI states
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  // Apply filters and sort
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Apply Quick Filters
    if (quickFilter === "fast-delivery") {
      result = result.filter((p) => p.deliveryText && p.deliveryText.includes("48 hours"));
    } else if (quickFilter === "best-seller") {
      result = result.filter((p) => (p.rating ?? 0) >= 4.9);
    } else if (quickFilter === "lowest-price") {
      result = result.filter((p) => p.price <= 80000);
    } else if (quickFilter === "limited-edition") {
      result = result.filter((p) => p.limitedEdition);
    }

    // Apply Size Filter
    if (selectedSize !== "all") {
      result = result.filter((p) => p.sizes.includes(selectedSize));
    }

    // Apply Sorting
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
      <main className="min-h-screen pb-16 bg-[#FAFAFA]">
        {/* Title / Header section */}
        <div className="px-4 pt-5 pb-3">
          <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
            Shop All
          </h1>
          <p className="font-sans text-xs text-[#7A7A7A] mt-1">
            Exclusive ready-to-wear, handloom sarees, and couture drops
          </p>
        </div>

        {/* Sort, Size, and Filter Strip matching image */}
        <div className="sticky top-[var(--top-bar-height)] z-30 bg-white border-b border-[#EBEBEB]">
          <div className="flex items-center justify-between text-center divide-x divide-[#EBEBEB] py-3.5">
            {/* SORT */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowSizeDropdown(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B]"
              >
                <span>SORT</span>
                <span className="text-[10px] text-gray-500">▼</span>
              </button>
              {showSortDropdown && (
                <div className="absolute top-10 left-4 w-44 bg-white border border-[#EBEBEB] rounded-lg shadow-lg py-1.5 z-40 text-left">
                  {(
                    [
                      { value: "default", label: "Default" },
                      { value: "price-low-high", label: "Price: Low to High" },
                      { value: "price-high-low", label: "Price: High to Low" },
                      { value: "customer-rating", label: "Customer Rating" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-xs text-left font-sans ${
                        sortBy === opt.value ? "bg-[#F0F0F0] font-semibold text-[#2B2B2B]" : "text-[#7A7A7A]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SIZES */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => {
                  setShowSizeDropdown(!showSizeDropdown);
                  setShowSortDropdown(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B]"
              >
                <span>SIZES</span>
                <span className="text-[10px] text-gray-500">▼</span>
              </button>
              {showSizeDropdown && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 bg-white border border-[#EBEBEB] rounded-lg shadow-lg py-1.5 z-40 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSize("all");
                      setShowSizeDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-xs text-left font-sans ${
                      selectedSize === "all" ? "bg-[#F0F0F0] font-semibold text-[#2B2B2B]" : "text-[#7A7A7A]"
                    }`}
                  >
                    All Sizes
                  </button>
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setShowSizeDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-xs text-left font-sans ${
                        selectedSize === size ? "bg-[#F0F0F0] font-semibold text-[#2B2B2B]" : "text-[#7A7A7A]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RESET */}
            <div className="flex-1">
              <button
                type="button"
                onClick={() => {
                  setSortBy("default");
                  setSelectedSize("all");
                  setQuickFilter("all");
                  setShowSortDropdown(false);
                  setShowSizeDropdown(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B]"
              >
                <span>RESET</span>
                <svg className="w-3.5 h-3.5 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Quick-Filter pills exactly like image */}
        <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#F0F0F0] overflow-x-auto hide-scrollbar flex items-center gap-2">
          <Link
            href="/designers"
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full font-sans text-xs font-bold border border-charcoal bg-charcoal text-paper shadow-xs hover:bg-black transition-colors"
          >
            🏬 Browse Houses
          </Link>
          {[
            { id: "all", label: "✨ Shop All" },
            { id: "fast-delivery", label: "⚡ Fast Delivery" },
            { id: "best-seller", label: "🎉 Best Seller" },
            { id: "lowest-price", label: "🥳 Under 80K" },
            { id: "limited-edition", label: "👑 Limited Run" },
          ].map((item) => {
            const active = quickFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setQuickFilter(item.id as QuickFilterOption)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-sans text-xs font-semibold border transition-all ${
                  active
                    ? "bg-[#2B2B2B] border-[#2B2B2B] text-white"
                    : "bg-white border-[#E0E0E0] text-[#4A4A4A]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Product Count details */}
        <div className="px-4 py-2.5 bg-[#FAFAFA] flex items-center justify-between">
          <p className="font-sans text-[10px] text-[#A0A0A0] uppercase tracking-wider font-semibold">
            Showing {processedProducts.length} of {products.length} pieces
          </p>
        </div>

        {/* Product Grid */}
        {catalog.enabled && (catalog.loading || catalog.error) ? (
          <CatalogStatus
            loading={catalog.loading}
            error={catalog.error}
            onRetry={catalog.reload}
          />
        ) : processedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 p-4 bg-[#FAFAFA]">
            {processedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-20 text-center bg-[#FAFAFA]">
            <p className="font-sans text-sm text-[#A0A0A0] mb-2 font-medium">
              No matching pieces found.
            </p>
            <button
              type="button"
              onClick={() => {
                setSortBy("default");
                setSelectedSize("all");
                setQuickFilter("all");
              }}
              className="text-xs font-semibold text-[#2B2B2B] underline uppercase tracking-wider"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}
