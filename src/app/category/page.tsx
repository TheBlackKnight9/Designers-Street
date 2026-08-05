"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import { CATEGORIES, PRODUCTS } from "@/lib/mock-data";
import { useStorefrontCategories, useStorefrontProducts } from "@/hooks/useStorefrontCatalog";
import { resolveCategoryImageUrl } from "@/lib/fashion-images";
import { sanitizeImageUrl } from "@/lib/utils/image-url";
import {
  buildSpotlightLinks,
  groupGenderSubcategories,
} from "@/lib/category-tree";
import type { Category } from "@/lib/types";

type PrimaryTab = "women" | "men" | "limited" | "latest";

const TABS: { id: PrimaryTab; label: string }[] = [
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
  { id: "limited", label: "Limited" },
  { id: "latest", label: "Latest" },
];

function findBranch(categories: Category[], slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

function SubcategoryChip({ item }: { item: Category }) {
  return (
    <Link
      href={`/category/${item.slug}`}
      className="px-3.5 py-2 rounded-full ds-chip text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-espresso hover:text-chip transition-colors"
    >
      {item.label}
    </Link>
  );
}

export default function CategoryIndexPage() {
  const [activeTab, setActiveTab] = useState<PrimaryTab>("women");
  const catalog = useStorefrontCategories();
  const productCatalog = useStorefrontProducts({ limit: 100 });
  const allProducts = productCatalog.enabled && productCatalog.products.length > 0
    ? productCatalog.products
    : PRODUCTS;

  const categories =
    catalog.enabled && catalog.categories.length > 0
      ? catalog.categories
      : CATEGORIES;

  const women = useMemo(() => findBranch(categories, "women"), [categories]);
  const men = useMemo(() => findBranch(categories, "men"), [categories]);
  const spotlights = useMemo(() => buildSpotlightLinks(categories), [categories]);

  const activeGender = activeTab === "men" ? "men" : "women";
  const activeBranch = activeGender === "men" ? men : women;
  const sections = useMemo(
    () =>
      activeTab === "women" || activeTab === "men"
        ? groupGenderSubcategories(activeBranch, activeGender, allProducts)
        : [],
    [activeTab, activeBranch, activeGender, allProducts]
  );

  const bannerImage = sanitizeImageUrl(
    resolveCategoryImageUrl(
      activeBranch?.slug || "womens-wear",
      activeBranch?.image
    )
  );

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-28 bg-transparent">
        <header className="px-5 pt-8 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone mb-2">
            Browse
          </p>
          <h1 className="font-sans text-[1.75rem] font-extrabold text-charcoal tracking-tight leading-none">
            Categories
          </h1>
          <p className="mt-2 text-[13px] text-stone leading-relaxed max-w-sm">
            Start with Women or Men, then open the edit you want.
          </p>
        </header>

        {/* Primary access: Women / Men / Limited / Latest */}
        <div
          className="px-4 pb-4 flex gap-2 overflow-x-auto hide-scrollbar"
          role="tablist"
          aria-label="Primary categories"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? tab.id === "limited" || tab.id === "latest"
                      ? "ds-chip-feature"
                      : "ds-chip-active"
                    : "ds-chip"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {catalog.enabled && (catalog.loading || catalog.error) ? (
          <CatalogStatus
            loading={catalog.loading}
            error={catalog.error}
            onRetry={catalog.reload}
            skeletonCount={3}
          />
        ) : (
          <div className="px-4 space-y-5 pb-8">
            {(activeTab === "women" || activeTab === "men") && activeBranch && (
              <>
                {/* Hero for gender */}
                <Link
                  href={`/category/${activeBranch.slug}`}
                  className="relative block aspect-[16/9] w-full overflow-hidden rounded-[1.5rem] bg-mist group"
                >
                  <Image
                    src={bannerImage}
                    alt={activeBranch.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="100vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 mb-1">
                      Shop all
                    </p>
                    <h2 className="font-sans text-xl font-extrabold text-paper tracking-tight">
                      {activeBranch.label}
                    </h2>
                    {activeBranch.caption && (
                      <p className="mt-1 text-[11px] text-white/75 font-medium line-clamp-1">
                        {activeBranch.caption}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Nested subcategory sections */}
                {sections.map((section) => (
                  <section key={section.id} className="space-y-2.5">
                    <div className="flex items-baseline justify-between px-0.5">
                      <div>
                        <h3 className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-charcoal">
                          {section.title}
                        </h3>
                        {section.hint && (
                          <p className="text-[11px] text-stone mt-0.5">{section.hint}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {section.items.map((item) => (
                        <SubcategoryChip key={item.slug} item={item} />
                      ))}
                    </div>
                  </section>
                ))}
              </>
            )}

            {activeTab === "limited" && (
              <section className="space-y-4">
                <div className="rounded-[1.5rem] bg-espresso text-chip p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-bronze mb-2">
                    Limited time
                  </p>
                  <h2 className="text-xl font-extrabold tracking-tight">
                    Small-batch editions
                  </h2>
                  <p className="mt-2 text-[13px] text-white/70 leading-relaxed">
                    Choose Women or Men limited runs — pieces that won&apos;t restock.
                  </p>
                </div>
                <div className="space-y-3">
                  {(spotlights.limited.length
                    ? spotlights.limited
                    : [
                        { slug: "women-limited-design", label: "Women · Limited" },
                        { slug: "men-limited-design", label: "Men · Limited" },
                      ]
                  ).map((item) => (
                    <Link
                      key={item.slug}
                      href={`/category/${item.slug}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-espresso/10 bg-chip px-4 py-4 shadow-[0_2px_10px_rgba(42,31,24,0.05)] active:scale-[0.99] transition"
                    >
                      <div>
                        <p className="text-[13px] font-extrabold text-charcoal">
                          {item.label.includes("Women") || item.slug.startsWith("women")
                            ? "Women"
                            : item.label.includes("Men") || item.slug.startsWith("men")
                              ? "Men"
                              : item.label}
                        </p>
                        <p className="text-[11px] text-stone mt-0.5">Limited design edits</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-full ds-chip-feature text-[10px] font-extrabold uppercase tracking-wider">
                        Shop →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "latest" && (
              <section className="space-y-4">
                <div className="rounded-[1.5rem] border border-espresso/10 bg-chip p-5 shadow-[0_2px_12px_rgba(42,31,24,0.06)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone mb-2">
                    Just landed
                  </p>
                  <h2 className="text-xl font-extrabold tracking-tight text-charcoal">
                    Latest drops
                  </h2>
                  <p className="mt-2 text-[13px] text-stone leading-relaxed">
                    Fresh atelier arrivals, sorted by Women and Men.
                  </p>
                </div>
                <div className="space-y-3">
                  {(spotlights.latest.length
                    ? spotlights.latest
                    : [
                        { slug: "women-latest-drop", label: "Women · Latest" },
                        { slug: "men-latest-drop", label: "Men · Latest" },
                      ]
                  ).map((item) => (
                    <Link
                      key={item.slug}
                      href={`/category/${item.slug}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-espresso/10 bg-chip px-4 py-4 shadow-[0_2px_10px_rgba(42,31,24,0.05)] active:scale-[0.99] transition"
                    >
                      <div>
                        <p className="text-[13px] font-extrabold text-charcoal">
                          {item.slug.startsWith("women")
                            ? "Women"
                            : item.slug.startsWith("men")
                              ? "Men"
                              : item.label}
                        </p>
                        <p className="text-[11px] text-stone mt-0.5">New arrivals</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-full ds-chip-active text-[10px] font-extrabold uppercase tracking-wider">
                        Shop →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Fallback if tree has unexpected top-level nodes beyond women/men */}
            {!women && !men && categories.length > 0 && (
              <div className="space-y-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="block rounded-2xl border border-espresso/10 bg-chip px-4 py-4"
                  >
                    <p className="font-extrabold text-charcoal">{cat.label}</p>
                    {cat.caption && (
                      <p className="text-[12px] text-stone mt-1">{cat.caption}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
