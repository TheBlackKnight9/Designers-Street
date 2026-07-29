"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { CATEGORIES } from "@/lib/mock-data";
import { useData } from "@/context/DataContext";

// Hero slides for the visual hero section
const HERO_SLIDES = [
  {
    id: "slide-1",
    title: "NEW SEASON DROPS",
    subtitle: "Couture silhouettes & limited edition ready-to-wear",
    image: "https://images.unsplash.com/photo-1610117238813-27404126b014?w=1600&q=80",
    ctaLabel: "EXPLORE COLLECTION",
    ctaLink: "/category/lehengas",
    tag: "Spring / Summer '26",
  },
  {
    id: "slide-2",
    title: "BRIDAL & TROUSSEAU '26",
    subtitle: "Hand-embroidered zardozi & 24K gold zari temple weaves",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1600&q=80",
    ctaLabel: "VIEW BRIDAL EDIT",
    ctaLink: "/category/sarees",
    tag: "Masterpiece Series",
  },
  {
    id: "slide-3",
    title: "BESPOKE & CUSTOM",
    subtitle: "White-glove made-to-measure by India's finest ateliers",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80",
    ctaLabel: "BOOK CONSULTATION",
    ctaLink: "/bespoke",
    tag: "Made to Measure",
  },
];

// Featured sections grid data
const FEATURED_WEEK = [
  {
    id: "feat-1",
    title: "DRESSES & GOWNS",
    subtitle: "Zero-waste column cuts & Italian crepe",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
    badge: "Trending Now",
    link: "/category/gowns",
    colSpan: "col-span-12 sm:col-span-6",
    aspectRatio: "aspect-[4/3]",
  },
  {
    id: "feat-2",
    title: "LEHENGA COUTURE",
    subtitle: "Midnight navy raw silk with hand-zardozi",
    image: "https://images.unsplash.com/photo-1610117238813-27404126b014?w=800&q=80",
    badge: "Limited Edition",
    link: "/category/lehengas",
    colSpan: "col-span-12 sm:col-span-6",
    aspectRatio: "aspect-[4/3]",
  },
  {
    id: "feat-3",
    title: "TEMPLE SILK SAREES",
    subtitle: "Kanchipuram handlooms with gold zari borders",
    image: "https://images.unsplash.com/photo-1610031340484-485bb87b2733?w=800&q=80",
    badge: "Heritage Master",
    link: "/category/sarees",
    colSpan: "col-span-12 sm:col-span-7",
    aspectRatio: "aspect-[16/9]",
  },
  {
    id: "feat-4",
    title: "SHERWANIS & TAILORING",
    subtitle: "Architectural suiting wool for ceremonies",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
    badge: "Groom Edit",
    link: "/category/sherwanis",
    colSpan: "col-span-12 sm:col-span-5",
    aspectRatio: "aspect-[16/9]",
  },
];

export default function HomePage() {
  const { products, designers, promoBanner } = useData();
  const [activeHero, setActiveHero] = useState(0);
  const [productFilter, setProductFilter] = useState<"all" | "women" | "men" | "limited">("all");

  // Autoplay hero slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentHero = HERO_SLIDES[activeHero];

  // Filter products for New Arrivals
  const newArrivals = products.filter((p) => {
    if (productFilter === "women") return p.gender === "women";
    if (productFilter === "men") return p.gender === "men";
    if (productFilter === "limited") return p.limitedEdition;
    return true;
  }).slice(0, 6);

  return (
    <>
      <TopBar />

      <main className="min-h-screen pb-16 bg-[#FDFCF8]">
        {/* Top Promo Banner / Delivery Bar */}
        <div className="bg-[#2B2B2B] text-white py-2 px-3 overflow-hidden text-center shadow-xs">
          <div className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-widest animate-shimmer">
            <span>{promoBanner}</span>
          </div>
        </div>

        {/* Large Visual Hero Section (Fashion E-Commerce Style) */}
        <section className="relative w-full aspect-[4/5] sm:aspect-[16/9] max-h-[600px] overflow-hidden bg-[#2B2B2B]">
          {/* Hero Image */}
          <Image
            src={currentHero.image}
            alt={currentHero.title}
            fill
            className="object-cover transition-opacity duration-1000"
            priority
            sizes="100vw"
          />

          {/* Dark Overlay gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Hero Tag & Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 z-10">
            <span className="inline-block self-start px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 shadow-xs">
              {currentHero.tag}
            </span>
            
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight leading-none drop-shadow-md mb-2">
              {currentHero.title}
            </h1>

            <p className="font-sans text-xs sm:text-base text-white/90 font-medium max-w-lg mb-6 leading-relaxed">
              {currentHero.subtitle}
            </p>

            <div className="flex items-center gap-4">
              <Link
                href={currentHero.ctaLink}
                className="px-6 py-3.5 bg-white text-[#2B2B2B] font-sans text-xs font-extrabold uppercase tracking-wider rounded-full shadow-lg active:scale-95 transition-transform"
              >
                {currentHero.ctaLabel}
              </Link>
              <Link
                href="/store"
                className="px-6 py-3.5 bg-black/40 backdrop-blur-md border border-white/40 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full active:scale-95 transition-transform"
              >
                SHOP ALL
              </Link>
            </div>

            {/* Slide Dots Indicator */}
            <div className="flex gap-2 mt-6">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveHero(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeHero ? "w-8 bg-white" : "w-2 bg-white/40"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Quick Category Icons Strip */}
        <section className="px-4 py-6 border-b border-white/40">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans text-xs font-extrabold uppercase tracking-wider text-[#2B2B2B]">
              Quick Browse
            </h2>
            <Link href="/category" className="text-[10px] font-bold uppercase tracking-widest text-[#7A7A7A] hover:text-[#2B2B2B]">
              View All →
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
            {CATEGORIES.flatMap((c) => (c.children ? c.children : [c])).slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden relative bg-[#D5DBE5] neu-raised-sm group-active:scale-95 transition-transform">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <span className="font-sans text-[10px] font-semibold text-[#2B2B2B] text-center max-w-[72px] line-clamp-1">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED THIS WEEK Section (Dynamic Content Grid) */}
        <section className="px-4 py-8">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A7A] block">
                Editor&apos;s Selection
              </span>
              <h2 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-tight">
                FEATURED THIS WEEK
              </h2>
            </div>
            <Link
              href="/store"
              className="px-3.5 py-1.5 bg-white text-[#2B2B2B] font-sans text-xs font-bold uppercase tracking-wider rounded-full neu-raised-sm"
            >
              Explore
            </Link>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {FEATURED_WEEK.map((item) => (
              <div key={item.id} className={`${item.colSpan} relative rounded-2xl overflow-hidden neu-raised-sm group`}>
                <Link href={item.link} className="block relative w-full h-full">
                  <div className={`relative w-full ${item.aspectRatio} bg-[#D5DBE5]`}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Badge top left */}
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full">
                      <span className="font-sans text-[9px] font-extrabold uppercase tracking-wider text-[#2B2B2B]">
                        {item.badge}
                      </span>
                    </div>

                    {/* Content bottom left */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide leading-tight">
                        {item.title}
                      </h3>
                      <p className="font-sans text-xs text-white/80 mt-0.5 font-medium line-clamp-1">
                        {item.subtitle}
                      </p>
                      <span className="inline-flex items-center gap-1 font-sans text-[10px] font-extrabold text-white uppercase tracking-widest mt-2 underline">
                        Shop Collection →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* NEW ARRIVALS Product Grid Section */}
        <section className="px-4 py-6 bg-[#FDFCF8] border-t border-white/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A7A] block">
                Fresh Off The Loom
              </span>
              <h2 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-tight">
                NEW ARRIVALS
              </h2>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-3 mb-2">
            {[
              { id: "all", label: "✨ All Pieces" },
              { id: "women", label: "💃 Women" },
              { id: "men", label: "🕺 Men" },
              { id: "limited", label: "👑 Limited Run" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProductFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full font-sans text-xs font-extrabold transition-all ${
                  productFilter === tab.id
                    ? "bg-[#2B2B2B] text-white shadow-md"
                    : "bg-white text-[#4A4A4A] neu-raised-sm"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 2-Column Product Grid */}
          <div className="grid grid-cols-2 gap-3">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* DESIGNER SPOTLIGHT Shelf */}
        <section className="px-4 py-8 border-t border-white/40">
          <div className="mb-5">
            <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A7A] block">
              Curated Atelier Directory
            </span>
            <h2 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-tight">
              THE DESIGNER HOUSES
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {designers.map((designer) => (
              <Link
                key={designer.id}
                href={`/designer/${designer.handle}`}
                className="flex-shrink-0 w-64 p-4 rounded-2xl neu-raised-sm bg-[#F3F0E9] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative bg-[#D5DBE5] border border-white/50 flex-shrink-0">
                      <Image
                        src={designer.logo}
                        alt={designer.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h3 className="font-sans text-xs font-extrabold text-[#2B2B2B] uppercase tracking-wide truncate">
                        {designer.name}
                      </h3>
                      <p className="font-sans text-[10px] text-[#7A7A7A] font-medium">
                        {designer.location}
                      </p>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-[#4A4A4A] line-clamp-2 leading-relaxed mb-4">
                    {designer.bio}
                  </p>
                </div>
                <span className="font-sans text-[10px] font-extrabold text-[#2B2B2B] uppercase tracking-widest underline group-hover:text-black">
                  View Atelier →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* BESPOKE COUTURE EXPERIENCE Banner */}
        <section className="px-4 py-6">
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[#2B2B2B] text-white overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-md">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest rounded-full inline-block mb-3">
                White-Glove Atelier Service
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-2 leading-tight">
                MADE-TO-MEASURE BESPOKE
              </h2>
              <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed mb-6 font-medium">
                Collaborate directly with master artisans for bridal, wedding reception &amp; ceremony wear tailored to your exact measurements.
              </p>
              <Link
                href="/bespoke"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-[#2B2B2B] font-sans text-xs font-extrabold uppercase tracking-wider rounded-full shadow-lg active:scale-95 transition-transform"
              >
                Start Customization
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>

      <BottomNav />
    </>
  );
}
