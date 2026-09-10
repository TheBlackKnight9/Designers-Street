"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import { PRODUCTS } from "@/lib/mock-data";
import { useStorefrontCategories, useStorefrontProducts } from "@/hooks/useStorefrontCatalog";
import { CATEGORY_MEDIA } from "@/lib/fashion-images";
import { productMatchesNavigationSlug } from "@/lib/category-tree";
import { Search, X, ArrowRight, Sparkles, Layers, ArrowUpRight } from "lucide-react";

type DepartmentId = "women" | "men" | "couture" | "jewellery" | "drops";

interface DepartmentDef {
  id: DepartmentId;
  label: string;
  badge?: string;
  hero: {
    tag: string;
    title: string;
    subtitle: string;
    cta: string;
    link: string;
    image: string;
  };
  edits: {
    label: string;
    slug: string;
  }[];
  silhouettes: {
    slug: string;
    title: string;
    subtitle: string;
    image: string;
    deptLabel: string;
  }[];
}

const DEPARTMENTS: DepartmentDef[] = [
  {
    id: "women",
    label: "Women's Couture",
    hero: {
      tag: "Autumn / Winter '26 Edit",
      title: "Women's Couture & Haute Pret",
      subtitle: "Handloom silks, architectural draping, sculpted bridal lehengas and modern ceremony wear.",
      cta: "Explore All Women's",
      link: "/category/women",
      image: CATEGORY_MEDIA["womens-wear"].hero,
    },
    edits: [
      { label: "Bridal Trousseau", slug: "women-bridal" },
      { label: "Cocktail Gala", slug: "women-gowns" },
      { label: "Heritage Handlooms", slug: "women-sarees" },
      { label: "Contemporary Pret", slug: "women-dresses" },
      { label: "Indo-Western Fusion", slug: "women-indo-western" },
      { label: "Anarkalis & Kurtas", slug: "women-kurtas" },
      { label: "Sustainable Silks", slug: "women-sustainable" },
    ],
    silhouettes: [
      {
        slug: "women-sarees",
        title: "Handloom Sarees",
        subtitle: "Banarasi, Kanjeevaram & Chanderi drapes",
        image: CATEGORY_MEDIA.sarees.primary,
        deptLabel: "Drape & Weave",
      },
      {
        slug: "women-lehengas",
        title: "Bridal Lehengas",
        subtitle: "Zardozi, gotapatti & layered flare",
        image: CATEGORY_MEDIA.lehengas.primary,
        deptLabel: "Ceremony",
      },
      {
        slug: "women-kurtas",
        title: "Kurtas & Anarkalis",
        subtitle: "Fluid ceremony sets & tunic cuts",
        image: CATEGORY_MEDIA.kurtas.primary,
        deptLabel: "Pret & Festive",
      },
      {
        slug: "women-gowns",
        title: "Evening Gowns",
        subtitle: "Architectural corsetry & column silhouettes",
        image: CATEGORY_MEDIA.gowns.primary,
        deptLabel: "Black-Tie",
      },
      {
        slug: "women-indo-western",
        title: "Indo-Western Sets",
        subtitle: "Cape sets, pant suits & modern jackets",
        image: CATEGORY_MEDIA["indo-western"].primary,
        deptLabel: "Fusion",
      },
      {
        slug: "women-dresses",
        title: "Designer Dresses",
        subtitle: "Bias-cut silks & embroidered shifts",
        image: CATEGORY_MEDIA.dresses.primary,
        deptLabel: "Contemporary",
      },
      {
        slug: "women-bridal",
        title: "Bridal Masterpieces",
        subtitle: "Handcrafted heirlooms for the ceremony",
        image: CATEGORY_MEDIA.bridal.primary,
        deptLabel: "High Couture",
      },
      {
        slug: "women-sustainable",
        title: "Sustainable Weaves",
        subtitle: "Organic botanical dyes & ahimsa silk",
        image: CATEGORY_MEDIA.sustainable.primary,
        deptLabel: "Artisanal",
      },
      {
        slug: "women-streetwear",
        title: "Luxury Streetwear",
        subtitle: "Technical outerwear & avant-garde separates",
        image: CATEGORY_MEDIA.streetwear.primary,
        deptLabel: "Avant-Garde",
      },
    ],
  },
  {
    id: "men",
    label: "Men's Ceremony",
    hero: {
      tag: "Ceremony & Black-Tie",
      title: "Men's Architectural Tailoring",
      subtitle: "Rigorous canvas construction, hand-pad stitched sherwanis, and regal bandhgalas.",
      cta: "Explore All Men's",
      link: "/category/men",
      image: CATEGORY_MEDIA["mens-wear"].hero,
    },
    edits: [
      { label: "Royal Groom", slug: "men-bridal" },
      { label: "Heritage Sherwanis", slug: "men-sherwanis" },
      { label: "Modern Bandhgalas", slug: "men-indo-western" },
      { label: "Silk Kurtas", slug: "men-kurtas" },
      { label: "Couture Suiting", slug: "men-mens-wear" },
      { label: "Handcrafted Juttis", slug: "men-footwear" },
    ],
    silhouettes: [
      {
        slug: "men-sherwanis",
        title: "Royal Sherwanis",
        subtitle: "Wool suiting & hand-finished closures",
        image: CATEGORY_MEDIA.sherwanis.primary,
        deptLabel: "Ceremony",
      },
      {
        slug: "men-kurtas",
        title: "Designer Kurtas",
        subtitle: "Chikankari & textured raw silk",
        image: CATEGORY_MEDIA.kurtas.alt,
        deptLabel: "Pret & Festive",
      },
      {
        slug: "men-indo-western",
        title: "Bandhgalas & Fusion",
        subtitle: "Structured nehru jackets & asymmetric cuts",
        image: CATEGORY_MEDIA["indo-western"].alt,
        deptLabel: "Modern Formal",
      },
      {
        slug: "men-bridal",
        title: "Groom Ensembles",
        subtitle: "Imperial ceremony sets with coordinated stoles",
        image: CATEGORY_MEDIA["mens-wear"].primary,
        deptLabel: "Groom's Suite",
      },
      {
        slug: "men-mens-wear",
        title: "Couture Suiting",
        subtitle: "Bespoke double-breasted blazers & trousers",
        image: CATEGORY_MEDIA["mens-wear"].alt,
        deptLabel: "Tailoring",
      },
      {
        slug: "men-footwear",
        title: "Artisanal Footwear",
        subtitle: "Handcrafted leather-soled juttis & loafers",
        image: CATEGORY_MEDIA.footwear.primary,
        deptLabel: "Footwear",
      },
      {
        slug: "men-sustainable",
        title: "Handloom Textures",
        subtitle: "Unbleached khadi & natural indigo dyes",
        image: CATEGORY_MEDIA.sustainable.alt,
        deptLabel: "Artisanal",
      },
      {
        slug: "men-streetwear",
        title: "Avant-Garde Streetwear",
        subtitle: "Modular outerwear & laser-cut technical coats",
        image: CATEGORY_MEDIA.streetwear.primary,
        deptLabel: "Street Couture",
      },
    ],
  },
  {
    id: "couture",
    label: "Couture & Bridal",
    badge: "Exclusive",
    hero: {
      tag: "Private Commissions",
      title: "Atelier Bridal & Haute Couture",
      subtitle: "One-of-a-kind heirloom garments crafted with centuries-old gold thread and zardozi techniques.",
      cta: "Bespoke Consultation",
      link: "/bespoke",
      image: CATEGORY_MEDIA["luxury-couture"].hero,
    },
    edits: [
      { label: "Imperial Bridal", slug: "women-bridal" },
      { label: "Royal Sherwanis", slug: "men-sherwanis" },
      { label: "Red Carpet Gowns", slug: "women-gowns" },
      { label: "Pure Zari Sarees", slug: "women-sarees" },
      { label: "Heirloom Goldwork", slug: "women-lehengas" },
    ],
    silhouettes: [
      {
        slug: "women-bridal",
        title: "Imperial Bridal Sets",
        subtitle: "Heirloom lehengas with real silver & gold zari",
        image: CATEGORY_MEDIA.bridal.primary,
        deptLabel: "Bridal",
      },
      {
        slug: "women-sarees",
        title: "Pure Gold Weaves",
        subtitle: "Varanasi kadwa & Kanchipuram silks",
        image: CATEGORY_MEDIA.sarees.hero,
        deptLabel: "Handloom",
      },
      {
        slug: "men-sherwanis",
        title: "Couture Sherwanis",
        subtitle: "Canvas crafted with miniature motif work",
        image: CATEGORY_MEDIA.sherwanis.hero,
        deptLabel: "Ceremony",
      },
      {
        slug: "women-gowns",
        title: "Sculptural Gowns",
        subtitle: "Zero-waste bias drape & crystal beading",
        image: CATEGORY_MEDIA.gowns.hero,
        deptLabel: "Runway",
      },
      {
        slug: "women-lehengas",
        title: "Couture Lehengas",
        subtitle: "Multi-layered flared silhouettes with bespoke veil",
        image: CATEGORY_MEDIA.lehengas.hero,
        deptLabel: "Bridal Suite",
      },
      {
        slug: "women-indo-western",
        title: "Modern Ceremony Drapes",
        subtitle: "Architectural capes & pre-stitched sarees",
        image: CATEGORY_MEDIA["indo-western"].hero,
        deptLabel: "Reception",
      },
    ],
  },
  {
    id: "jewellery",
    label: "Jewellery & Finery",
    hero: {
      tag: "High Finery",
      title: "Heirloom Jewels & Leather Craft",
      subtitle: "Uncut Polki diamonds, 24K gold temple ornaments, and hand-embroidered velvet clutches.",
      cta: "Explore Fine Jewels",
      link: "/category/jewellery-accessories",
      image: CATEGORY_MEDIA["jewellery-accessories"].hero,
    },
    edits: [
      { label: "Polki & Kundan", slug: "jewellery-accessories" },
      { label: "Temple Heirlooms", slug: "jewellery-accessories" },
      { label: "Velvet Potlis", slug: "women-bags" },
      { label: "Embroidered Juttis", slug: "women-footwear" },
      { label: "Pashmina Wraps", slug: "women-accessories" },
    ],
    silhouettes: [
      {
        slug: "jewellery-accessories",
        title: "Polki & Kundan Sets",
        subtitle: "Uncut gemstones set in 22K hallmarked gold",
        image: CATEGORY_MEDIA.jewellery.primary,
        deptLabel: "High Jewellery",
      },
      {
        slug: "jewellery-accessories",
        title: "Temple Heirlooms",
        subtitle: "Antique gold carvings & pearl jhumkas",
        image: CATEGORY_MEDIA.jewellery.alt,
        deptLabel: "Heritage Gold",
      },
      {
        slug: "women-bags",
        title: "Embroidered Potlis",
        subtitle: "Zardozi worked velvet & silk box clutches",
        image: CATEGORY_MEDIA.bags.primary,
        deptLabel: "Evening Bags",
      },
      {
        slug: "women-footwear",
        title: "Handcrafted Juttis",
        subtitle: "Padded leather soles with hand zari uppers",
        image: CATEGORY_MEDIA.footwear.primary,
        deptLabel: "Footwear",
      },
      {
        slug: "women-accessories",
        title: "Fine Silk Dupattas",
        subtitle: "Kashmiri sozni & real silver tissue wraps",
        image: CATEGORY_MEDIA.accessories.primary,
        deptLabel: "Accessories",
      },
      {
        slug: "men-footwear",
        title: "Men's Ceremony Loafers",
        subtitle: "Hand-lasted velvet and gilded mojris",
        image: CATEGORY_MEDIA.footwear.alt,
        deptLabel: "Men's Footwear",
      },
    ],
  },
  {
    id: "drops",
    label: "Capsule Drops",
    badge: "New",
    hero: {
      tag: "Weekly Atelier Releases",
      title: "Limited Run Editions & Drops",
      subtitle: "Numbered runway pieces, weekly capsule drops, and pre-orders. When sold, they are archived.",
      cta: "View Latest Drops",
      link: "/category/latest-drops",
      image: CATEGORY_MEDIA["latest-drops"].hero,
    },
    edits: [
      { label: "Just Landed", slug: "latest-drop" },
      { label: "Numbered Archive", slug: "limited-design" },
      { label: "Runway Pre-Order", slug: "latest-drops" },
      { label: "Celebrity Editions", slug: "women-latest-drop" },
    ],
    silhouettes: [
      {
        slug: "latest-drop",
        title: "Just Landed Pieces",
        subtitle: "Fresh pieces from Mumbai, Delhi & Jaipur",
        image: CATEGORY_MEDIA["latest-drops"].primary,
        deptLabel: "This Week",
      },
      {
        slug: "limited-design",
        title: "Numbered Capsules",
        subtitle: "Small batches capped at 12 garments worldwide",
        image: CATEGORY_MEDIA["luxury-couture"].primary,
        deptLabel: "Limited Edition",
      },
      {
        slug: "women-streetwear",
        title: "Technical Streetwear",
        subtitle: "Waterproof ripstop silk & modular cuts",
        image: CATEGORY_MEDIA.streetwear.primary,
        deptLabel: "Street Couture",
      },
      {
        slug: "women-gowns",
        title: "Runway Columns",
        subtitle: "Editorial silhouettes worn on international runways",
        image: CATEGORY_MEDIA.gowns.alt,
        deptLabel: "Red Carpet",
      },
      {
        slug: "men-streetwear",
        title: "Men's Urban Outerwear",
        subtitle: "Laser-cut seams & bonded suiting wool",
        image: CATEGORY_MEDIA.streetwear.hero,
        deptLabel: "Men's Street",
      },
    ],
  },
];

const DIRECTORY_SILHOUETTES = [
  { label: "Accessories & Stoles", slug: "women-accessories", dept: "Women" },
  { label: "Anarkalis & Kurtas", slug: "women-kurtas", dept: "Women" },
  { label: "Bags & Clutches", slug: "women-bags", dept: "Women" },
  { label: "Bandhgalas & Jackets", slug: "men-indo-western", dept: "Men" },
  { label: "Bridal Lehengas", slug: "women-bridal", dept: "Women" },
  { label: "Cocktail Gowns", slug: "women-gowns", dept: "Women" },
  { label: "Contemporary Dresses", slug: "women-dresses", dept: "Women" },
  { label: "Designer Kurtas (Men)", slug: "men-kurtas", dept: "Men" },
  { label: "Handcrafted Footwear", slug: "women-footwear", dept: "All" },
  { label: "Handloom Sarees", slug: "women-sarees", dept: "Women" },
  { label: "Indo-Western Sets", slug: "women-indo-western", dept: "Women" },
  { label: "Jewellery & Kundan", slug: "jewellery-accessories", dept: "All" },
  { label: "Kids Ceremonial", slug: "women-kids", dept: "Kids" },
  { label: "Limited Capsule Runs", slug: "limited-design", dept: "Archive" },
  { label: "Luxury Streetwear", slug: "women-streetwear", dept: "All" },
  { label: "Royal Sherwanis", slug: "men-sherwanis", dept: "Men" },
  { label: "Suiting & Tailoring", slug: "men-mens-wear", dept: "Men" },
  { label: "Sustainable Weaves", slug: "women-sustainable", dept: "All" },
];

export default function CategoryIndexPage() {
  const [activeTab, setActiveTab] = useState<DepartmentId>("women");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDirectory, setShowDirectory] = useState(false);

  const productCatalog = useStorefrontProducts({ limit: 100 });
  const allProducts =
    productCatalog.enabled && productCatalog.products.length > 0
      ? productCatalog.products
      : PRODUCTS;

  // Precompute product counts per category slug
  const productCountMap = useMemo(() => {
    const map = new Map<string, number>();
    const allSilhouettes = DEPARTMENTS.flatMap((d) => d.silhouettes);
    for (const prod of allProducts) {
      for (const sil of allSilhouettes) {
        if (productMatchesNavigationSlug(prod, sil.slug)) {
          map.set(sil.slug, (map.get(sil.slug) || 0) + 1);
        }
      }
    }
    return map;
  }, [allProducts]);

  const activeDepartment = useMemo(
    () => DEPARTMENTS.find((d) => d.id === activeTab) || DEPARTMENTS[0],
    [activeTab]
  );

  // Filtered silhouettes if user searches
  const filteredSilhouettes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    // Search across all departments
    const all = DEPARTMENTS.flatMap((d) => d.silhouettes);
    return all.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.deptLabel.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-28 bg-[var(--canvas)] pt-[84px]">
        <h1 className="sr-only">Categories & Silhouettes — Designer&apos;s Street</h1>

        {/* Sticky Department Switcher */}
        <nav
          aria-label="Department Categories"
          className="sticky top-[84px] z-30 bg-white/95 backdrop-blur-md border-b border-[var(--border-subtle)]"
        >
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {DEPARTMENTS.map((dept) => {
              const active = activeTab === dept.id;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(dept.id);
                    setSearchQuery("");
                  }}
                  className={`flex-shrink-0 relative px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ${
                    active
                      ? "bg-[var(--charcoal)] text-white shadow-sm"
                      : "bg-[var(--mist)] text-[var(--stone)] hover:text-[var(--charcoal)] hover:bg-black/5"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {dept.label}
                    {dept.badge && (
                      <span
                        className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[var(--charcoal)] text-white"
                        }`}
                      >
                        {dept.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 space-y-6">
          {/* In-Category Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--stone)] stroke-[1.75]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeDepartment.label} (lehengas, sarees, sherwanis, jewels...)`}
              className="w-full rounded-xl border border-[var(--border-default)] bg-white pl-10 pr-9 py-2.5 text-xs font-medium text-[var(--charcoal)] placeholder:text-[var(--stone)]/70 focus:outline-none focus:border-[var(--charcoal)] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--stone)] hover:text-[var(--charcoal)]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Mode */}
          {filteredSilhouettes !== null ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[var(--stone)]">
                  Found <span className="font-semibold text-[var(--charcoal)]">{filteredSilhouettes.length}</span>{" "}
                  {filteredSilhouettes.length === 1 ? "silhouette" : "silhouettes"} for &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-[11px] font-semibold text-[var(--charcoal)] underline underline-offset-2"
                >
                  Clear search
                </button>
              </div>

              {filteredSilhouettes.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-5">
                  {filteredSilhouettes.map((item) => {
                    const count = productCountMap.get(item.slug) ?? 0;
                    return (
                      <Link
                        key={item.slug + item.title}
                        href={`/category/${item.slug}`}
                        className="group relative flex flex-col rounded-xl overflow-hidden bg-[var(--mist)] transition-all duration-300 hover:shadow-lg active:scale-[0.99]"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[9px] font-mono font-medium">
                            {count > 0 ? `${count} pieces` : "Atelier"}
                          </span>
                          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
                            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/70 mb-0.5">
                              {item.deptLabel}
                            </p>
                            <h3 className="font-display text-sm sm:text-base font-semibold tracking-wide leading-tight group-hover:underline underline-offset-2">
                              {item.title}
                            </h3>
                            <p className="text-[10px] text-white/70 mt-1 line-clamp-1 hidden sm:block">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center bg-white rounded-2xl border border-[var(--border-subtle)] px-4">
                  <p className="font-display text-base font-semibold text-[var(--charcoal)] mb-1">
                    No matching silhouettes found
                  </p>
                  <p className="text-xs text-[var(--stone)] mb-4">
                    Try searching for &ldquo;sarees&rdquo;, &ldquo;lehengas&rdquo;, &ldquo;sherwanis&rdquo;, or &ldquo;gowns&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 rounded-full bg-[var(--charcoal)] text-white text-[11px] font-semibold uppercase tracking-wider"
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </section>
          ) : (
            /* Normal Department Browsing Mode */
            <>
              {/* Proportional Hero Banner */}
              <div className="relative aspect-[16/7] sm:aspect-[21/8] md:aspect-[24/8] w-full overflow-hidden rounded-2xl bg-[var(--mist)] group">
                <Image
                  src={activeDepartment.hero.image}
                  alt={activeDepartment.hero.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent sm:w-3/4" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 md:p-8 max-w-xl text-white">
                  <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 mb-1">
                    {activeDepartment.hero.tag}
                  </p>
                  <h2 className="font-display text-lg sm:text-2xl md:text-3xl font-semibold tracking-wide leading-tight text-white mb-1.5">
                    {activeDepartment.hero.title}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-white/80 line-clamp-2 max-w-md mb-3 sm:mb-4">
                    {activeDepartment.hero.subtitle}
                  </p>
                  <div>
                    <Link
                      href={activeDepartment.hero.link}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[var(--charcoal)] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-white/90 active:scale-95 transition-all"
                    >
                      {activeDepartment.hero.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Thematic Edits Row */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--stone)] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[var(--charcoal)]" />
                    Curated Edits
                  </h3>
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {activeDepartment.edits.map((edit) => (
                    <Link
                      key={edit.slug + edit.label}
                      href={`/category/${edit.slug}`}
                      className="flex-shrink-0 px-3.5 py-2 rounded-full border border-[var(--border-default)] bg-white text-[11px] font-medium text-[var(--charcoal)] hover:border-[var(--charcoal)] hover:bg-black/5 transition-colors"
                    >
                      {edit.label}
                    </Link>
                  ))}
                </div>
              </section>

              {/* Core Visual Silhouette Grid */}
              <section className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base sm:text-lg font-semibold text-[var(--charcoal)] tracking-wide">
                    Explore Silhouettes
                  </h3>
                  <span className="text-[11px] font-mono text-[var(--stone)]">
                    {activeDepartment.silhouettes.length} categories
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-5">
                  {activeDepartment.silhouettes.map((item) => {
                    const count = productCountMap.get(item.slug) ?? 0;
                    return (
                      <Link
                        key={item.slug}
                        href={`/category/${item.slug}`}
                        className="group relative flex flex-col rounded-xl overflow-hidden bg-[var(--mist)] transition-all duration-300 hover:shadow-lg active:scale-[0.99]"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Rich subtle gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Piece count badge */}
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[9px] font-mono font-medium">
                            {count > 0 ? `${count} pieces` : "Atelier"}
                          </span>

                          {/* Bottom metadata */}
                          <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 text-white">
                            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/70 mb-0.5">
                              {item.deptLabel}
                            </p>
                            <h4 className="font-display text-sm sm:text-base md:text-lg font-semibold tracking-wide leading-tight group-hover:underline underline-offset-2">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-white/75 mt-1 line-clamp-1 hidden sm:block">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Collapsible A-Z Silhouette Directory */}
              <section className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
                <button
                  type="button"
                  onClick={() => setShowDirectory(!showDirectory)}
                  className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[var(--stone)] group-hover:text-[var(--charcoal)] transition-colors" />
                    <span className="font-display text-sm font-semibold text-[var(--charcoal)] tracking-wide">
                      A-Z Silhouette Directory
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--stone)] group-hover:text-[var(--charcoal)] transition-colors">
                    {showDirectory ? "Hide ↑" : "Show All ↓"}
                  </span>
                </button>

                {showDirectory && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 animate-in fade-in duration-300">
                    {DIRECTORY_SILHOUETTES.map((item) => (
                      <Link
                        key={item.slug + item.label}
                        href={`/category/${item.slug}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[var(--border-subtle)] hover:border-[var(--charcoal)] hover:bg-black/5 text-xs transition-colors"
                      >
                        <span className="font-medium text-[var(--charcoal)] truncate">
                          {item.label}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-[var(--stone)] flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
