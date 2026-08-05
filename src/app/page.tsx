"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import { NewmeProductCard } from "@/components/ui/NewmeProductCard";
import { NewmeHeroCarousel, type HeroSlide } from "@/components/newme/NewmeHeroCarousel";
import { NewmeFeaturedRail } from "@/components/newme/NewmeFeaturedRail";
import { NewmeCategoryMegaCard } from "@/components/newme/NewmeCategoryMegaCard";
import { flattenBrowseCategories } from "@/lib/category-tree";
import { NewmeDesignerHousesRail } from "@/components/newme/NewmeDesignerHousesRail";
import { useEditorialHome } from "@/hooks/useEditorial";
import {
  useStorefrontProducts,
  useStorefrontCategories,
  useStorefrontDesigners,
} from "@/hooks/useStorefrontCatalog";
import { CATEGORIES, DESIGNERS, PRODUCTS } from "@/lib/mock-data";

export default function HomePage() {
  const { data: editorialData, loading: editorialLoading } = useEditorialHome();
  const catalogProducts = useStorefrontProducts({ limit: 48 });
  const catalogCategories = useStorefrontCategories();
  const catalogDesigners = useStorefrontDesigners();

  const products = catalogProducts.enabled ? catalogProducts.products : PRODUCTS;
  const designers = catalogDesigners.enabled ? catalogDesigners.designers : DESIGNERS;
  const categories = catalogCategories.enabled ? catalogCategories.categories : CATEGORIES;

  const [activeGender, setActiveGender] = useState<"all" | "women" | "men">("all");

  const filteredProducts = products.filter((p) => {
    if (activeGender === "all") return true;
    return p.gender === activeGender || p.gender === "unisex";
  });

  const heroSlides = useMemo((): HeroSlide[] => {
    const slides: HeroSlide[] = [];

    if (editorialData?.campaign?.heroImage) {
      slides.push({
        id: `campaign-${editorialData.campaign.id}`,
        image: editorialData.campaign.heroImage,
        title: editorialData.campaign.title,
        subtitle: editorialData.campaign.subtitle || editorialData.campaign.badge,
        href: editorialData.campaign.ctaLink || `/editorial/${editorialData.campaign.slug}`,
      });
    }

    categories.slice(0, 4).forEach((cat) => {
      slides.push({
        id: `cat-${cat.slug}`,
        image: cat.image,
        title: cat.label,
        subtitle: "Shop the edit",
        href: `/category/${cat.slug}`,
      });
    });

    designers.slice(0, 2).forEach((d) => {
      if (d.banner) {
        slides.push({
          id: `designer-${d.id}`,
          image: d.banner,
          title: d.name,
          subtitle: "Designer House",
          href: `/designer/${d.handle}`,
        });
      }
    });

    return slides;
  }, [editorialData, categories, designers]);

  return (
    <>
      <TopBar />

      <main className="min-h-screen bg-transparent pb-28">
        {/* Editorial nav strip */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar border-b border-[var(--border-subtle)]">
          <Link
            href="/designers"
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] ds-chip-feature"
          >
            Houses
          </Link>
          <Link
            href="/feed"
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] ds-chip"
          >
            Feed
          </Link>
          <Link
            href="/bespoke"
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] ds-chip"
          >
            Bespoke
          </Link>
          {(["all", "women", "men"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setActiveGender(g)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                activeGender === g ? "ds-chip-active" : "ds-chip"
              }`}
            >
              {g === "all" ? "All" : g === "women" ? "Women" : "Men"}
            </button>
          ))}
        </div>

        {editorialLoading && !heroSlides.length ? (
          <CatalogStatus loading skeletonCount={2} />
        ) : (
          <NewmeHeroCarousel slides={heroSlides} />
        )}

        <NewmeFeaturedRail products={filteredProducts} />

        <NewmeDesignerHousesRail designers={designers} />

        {/* Category mega cards — framed editorial scrapbook style */}
        {flattenBrowseCategories(categories, 2)
          .filter((cat) => !cat.slug.endsWith("-latest-drop") && !cat.slug.endsWith("-limited-design"))
          .slice(0, 6)
          .map((cat, i) => {
          const productSlug = cat.slug.replace(/^(women|men)-/, "");
          const matchedProduct =
            filteredProducts.find(
              (p) =>
                p.category?.toLowerCase() === productSlug ||
                p.category?.toLowerCase().replace(/\s+/g, "-") === productSlug
            ) ??
            products.find(
              (p) =>
                p.category?.toLowerCase() === productSlug ||
                p.category?.toLowerCase().replace(/\s+/g, "-") === productSlug
            );

          const designerName =
            matchedProduct?.designerName ??
            designers.find((d) => d.id === matchedProduct?.designerId)?.name ??
            designers[i % designers.length]?.name;

          return (
            <NewmeCategoryMegaCard
              key={cat.slug}
              category={cat}
              index={i}
              imageOverride={matchedProduct?.images?.[0]}
              designerName={designerName}
            />
          );
        })}

        {/* Invite / referral */}
        <section className="mx-4 my-8 p-6 rounded-[1.5rem] bg-charcoal text-paper">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
            Private Access
          </p>
          <h3 className="text-lg font-extrabold tracking-tight leading-tight">
            Invite friends to the atelier
          </h3>
          <p className="text-[13px] text-white/70 mt-2 mb-4 leading-relaxed">
            Share Designer&apos;s Street — exclusive house access for both of you.
          </p>
          <Link
            href="/profile/following"
            className="inline-block px-5 py-2.5 rounded-full bg-bronze text-[#1A120C] text-[11px] font-extrabold uppercase tracking-[0.12em] shadow-[0_2px_10px_rgba(166,124,82,0.35)]"
          >
            Invite friends
          </Link>
        </section>

        <section className="px-4 py-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-sm font-black uppercase text-charcoal mb-3">Explore</h3>
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] font-semibold text-stone">
            {[
              { label: "Designer Houses", href: "/designers" },
              { label: "Feed", href: "/feed" },
              { label: "Search", href: "/search" },
              { label: "Wishlist", href: "/wishlist" },
              { label: "Orders", href: "/orders" },
              { label: "Addresses", href: "/profile/addresses" },
            ].map((link, i) => (
              <span key={link.href} className="inline-flex items-center gap-1">
                {i > 0 && <span className="text-silver">|</span>}
                <Link href={link.href} className="hover:text-charcoal underline-offset-2 hover:underline">
                  {link.label}
                </Link>
              </span>
            ))}
          </div>
        </section>

        {/* Shop For — pipe-separated links */}
        <section className="px-4 py-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-sm font-black uppercase text-charcoal mb-3">Shop For</h3>
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] font-semibold text-stone">
            {categories.map((cat, i) => (
              <span key={cat.slug} className="inline-flex items-center gap-1">
                {i > 0 && <span className="text-silver">|</span>}
                <Link href={`/category/${cat.slug}`} className="hover:text-charcoal underline-offset-2 hover:underline">
                  {cat.label}
                </Link>
              </span>
            ))}
          </div>
        </section>

        {/* Product feed grid */}
        <section className="px-4 py-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase text-charcoal">
              Trending <span className="text-[var(--newme-green-dark)]">Now</span>
            </h2>
            <Link href="/store" className="text-[11px] font-bold uppercase underline text-charcoal">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {filteredProducts.map((p) => (
              <NewmeProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Footer links */}
        <footer className="px-4 pt-6 pb-8 border-t border-[var(--border-subtle)] text-[11px] text-stone space-y-4">
          <div>
            <p className="font-black uppercase text-charcoal mb-2">Customer Policies</p>
            <div className="flex flex-wrap gap-x-1 gap-y-1">
              {[
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
                { label: "Bespoke", href: "/bespoke" },
                { label: "Seller Terms", href: "/seller-terms" },
              ].map((link, i) => (
                <span key={link.href} className="inline-flex items-center gap-1">
                  {i > 0 && <span>|</span>}
                  <Link href={link.href} className="hover:text-charcoal">{link.label}</Link>
                </span>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-silver">
            Designer&apos;s Street — Exclusive limited-edition collections from India&apos;s celebrated houses.
          </p>
        </footer>
      </main>
    </>
  );
}
