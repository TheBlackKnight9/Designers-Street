"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS, DESIGNERS, formatPrice } from "@/lib/mock-data";
import {
  listProducts,
  listDesigners,
  isRemoteApiEnabled,
} from "@/lib/api/catalog";
import type { Product, DesignerHouse } from "@/lib/types";
import { getDesignerUrl } from "@/lib/routes";

interface SearchOverlayProps {
  onClose: () => void;
}

const TRENDING = [
  "Bridal Lehengas",
  "Pashmina",
  "Sherwanis",
  "Cocktail Sarees",
  "Bespoke",
];

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(PRODUCTS);
  const [catalogDesigners, setCatalogDesigners] =
    useState<DesignerHouse[]>(DESIGNERS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!isRemoteApiEnabled()) {
      setCatalogProducts(PRODUCTS);
      setCatalogDesigners(DESIGNERS);
      return;
    }
    let cancelled = false;
    Promise.all([listProducts({ limit: 100 }), listDesigners()])
      .then(([products, designers]) => {
        if (!cancelled) {
          setCatalogProducts(products);
          setCatalogDesigners(designers);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogProducts([]);
          setCatalogDesigners([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lowerQuery = query.toLowerCase().trim();

  const matchedProducts =
    lowerQuery.length >= 2
      ? catalogProducts
          .filter(
            (p) =>
              p.name.toLowerCase().includes(lowerQuery) ||
              p.designerName.toLowerCase().includes(lowerQuery) ||
              p.category.toLowerCase().includes(lowerQuery) ||
              (p.occasion && p.occasion.toLowerCase().includes(lowerQuery)) ||
              (p.tags && p.tags.some((t) => t.toLowerCase().includes(lowerQuery)))
          )
          .slice(0, 6)
      : [];

  const matchedDesigners =
    lowerQuery.length >= 2
      ? catalogDesigners
          .filter(
            (d) =>
              d.name.toLowerCase().includes(lowerQuery) ||
              d.bio.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 3)
      : [];

  const suggestedDesigners = catalogDesigners.slice(0, 4);

  return (
    <div className="fixed inset-0 z-[70] bg-[#E0E5EC] flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 px-4 h-[var(--top-bar-height)] border-b border-white/40 shadow-xs">
        <svg
          className="w-5 h-5 text-[#A0A0A0] flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search designers, collections, occasions…"
          className="flex-1 bg-transparent font-sans text-sm text-[#2B2B2B] placeholder:text-[#A0A0A0] outline-none"
        />
        <button
          type="button"
          onClick={onClose}
          className="font-sans text-sm font-medium text-[#7A7A7A]"
        >
          Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {lowerQuery.length < 2 ? (
          <>
            <div className="mb-6">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#A0A0A0] mb-3">
                Trending
              </h3>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-[#F0F0F0] text-[#2B2B2B] text-xs font-medium rounded-full tap-highlight"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#A0A0A0] mb-3">
                Designer Houses
              </h3>
              <div className="space-y-3">
                {suggestedDesigners.map((d) => (
                  <Link
                    key={d.id}
                    href={getDesignerUrl(d.handle) ?? "/"}
                    onClick={onClose}
                    className="flex items-center gap-3 tap-highlight py-1"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#F0F0F0]">
                      <Image
                        src={d.logo}
                        alt={d.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <span className="font-sans text-sm font-medium text-[#2B2B2B] block">
                        {d.name}
                      </span>
                      <span className="font-sans text-xs text-[#7A7A7A]">
                        {d.location}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {matchedDesigners.length > 0 && (
              <div className="mb-6">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#A0A0A0] mb-3">
                  Designers
                </h3>
                <div className="space-y-3">
                  {matchedDesigners.map((d) => (
                    <Link
                      key={d.id}
                      href={getDesignerUrl(d.handle) ?? "/"}
                      onClick={onClose}
                      className="flex items-center gap-3 tap-highlight py-1"
                    >
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#F0F0F0]">
                        <Image
                          src={d.logo}
                          alt={d.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <span className="font-sans text-sm font-medium text-[#2B2B2B] block">
                          {d.name}
                        </span>
                        <span className="font-sans text-xs text-[#7A7A7A]">
                          {d.bio}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {matchedProducts.length > 0 && (
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#A0A0A0] mb-3">
                  Products
                </h3>
                <div className="space-y-3">
                  {matchedProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 tap-highlight py-1"
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#F0F0F0] flex-shrink-0">
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-[#A0A0A0] block">
                          {p.designerName}
                        </span>
                        <span className="font-sans text-sm font-medium text-[#2B2B2B] block truncate">
                          {p.name}
                        </span>
                        <span className="font-sans text-xs font-semibold text-[#2B2B2B]">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {matchedProducts.length === 0 && matchedDesigners.length === 0 && (
              <div className="text-center py-12">
                <p className="font-sans text-sm text-[#A0A0A0]">
                  No results for &ldquo;{query}&rdquo;
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
