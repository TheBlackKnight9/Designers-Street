"use client";

import { use, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { PRODUCTS, findCategoryBySlug, formatPrice } from "@/lib/mock-data";
import { useData } from "@/context/DataContext";
import { useCart } from "@/context/CartContext";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type SortOption = "default" | "price-low-high" | "price-high-low" | "customer-rating";
type QuickFilterOption = "all" | "fast-delivery" | "best-seller" | "lowest-price" | "limited-edition";

export default function CategoryPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = use(params);
  const { products: allProducts } = useData();
  const { itemCount } = useCart();
  const category = findCategoryBySlug(slug);

  // States
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilterOption>("all");

  // Dropdown UI states
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  // Filter products matching this category or subcategory
  const baseProducts = useMemo(() => {
    const s = slug.toLowerCase();
    return allProducts.filter((p) => {
      if (s === "traditional") {
        return p.tags?.includes("traditional") || !!p.craftOrigin || !!p.technique;
      }
      if (s === "limited-edition") {
        return !!p.limitedEdition || (p.piecesRemaining !== undefined && p.piecesRemaining > 0);
      }
      return (
        p.category === s ||
        p.subcategory === s ||
        s.includes(p.category) ||
        (p.gender === "women" && s.startsWith("women")) ||
        (p.gender === "men" && s.startsWith("men")) ||
        (s.includes("bridal") && p.occasion === "Bridal") ||
        (s.includes("cocktail") && p.occasion === "Cocktail")
      );
    });
  }, [slug, allProducts]);

  // Apply filters and sort
  const processedProducts = useMemo(() => {
    let result = [...baseProducts];

    // Apply Quick Filters
    if (quickFilter === "fast-delivery") {
      result = result.filter((p) => p.deliveryText && p.deliveryText.includes("48 hours"));
    } else if (quickFilter === "best-seller") {
      result = result.filter((p) => (p.rating ?? 0) >= 4.9);
    } else if (quickFilter === "lowest-price") {
      // Sort by price helper for this subset or filter below 80k
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
  }, [baseProducts, sortBy, selectedSize, quickFilter]);

  const uniqueSizes = useMemo(() => {
    const sizes = new Set<string>();
    baseProducts.forEach((p) => p.sizes.forEach((s) => sizes.add(s)));
    return Array.from(sizes);
  }, [baseProducts]);

  const categoryTitle = category ? category.label : slug.replace(/-/g, " ");

  return (
    <>
      {/* Header exactly like image: Back arrow, Title, Bag, Search */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[var(--top-bar-height)] flex items-center justify-between px-4 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-[#EBEBEB]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="touch-target flex items-center justify-center cursor-pointer"
            aria-label="Go back"
          >
            <svg className="w-5 h-5 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="font-sans text-sm font-semibold uppercase tracking-wide text-[#2B2B2B] truncate max-w-[180px]">
            {categoryTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="touch-target flex items-center justify-center relative"
            aria-label="Shopping bag"
          >
            <svg className="w-5 h-5 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#2B2B2B] text-[#FAFAFA] text-[9px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Search Icon */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="touch-target flex items-center justify-center cursor-pointer"
            aria-label="Search"
          >
            <svg className="w-5 h-5 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Spacer to push down content */}
      <div className="h-[var(--top-bar-height)]" />

      <main className="min-h-screen pb-16 bg-[#FAFAFA]">
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

            {/* FILTERS */}
            <div className="flex-1">
              <button
                type="button"
                onClick={() => {
                  // Reset all filters
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
            Showing {processedProducts.length} of {baseProducts.length} pieces
          </p>
        </div>

        {/* Product Grid */}
        {processedProducts.length > 0 ? (
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
