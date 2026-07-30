"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { DesignerGridPost } from "@/components/designer/DesignerGridPost";
import { ShareButton } from "@/components/ShareButton";
import { FEED_POSTS } from "@/lib/mock-data";
import { useData } from "@/context/DataContext";
import { useStorefrontDesigner } from "@/hooks/useStorefrontCatalog";
import { listFeed, isRemoteApiEnabled } from "@/lib/api/catalog";
import { useFollow } from "@/hooks/useSocial";
import type { FeedPostData } from "@/lib/types";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default function DesignerProfilePage({ params }: PageProps) {
  const { handle } = use(params);
  const { designers, products: allProducts } = useData();
  const {
    designer: apiDesigner,
    products: apiProducts,
    enabled: apiEnabled,
    loading: apiLoading,
  } = useStorefrontDesigner(handle);

  const mockDesigner = designers.find(
    (d) =>
      d.handle.toLowerCase() === handle.toLowerCase() ||
      d.name.toLowerCase() === handle.toLowerCase()
  );
  const designer = apiEnabled ? apiDesigner : mockDesigner;

  const [activeTab, setActiveTab] = useState<"posts" | "shop">("posts");
  const [feedPosts, setFeedPosts] = useState<FeedPostData[]>([]);
  const [followSeed, setFollowSeed] = useState<{
    following: boolean;
    followersCount: number;
  } | null>(null);

  useEffect(() => {
    if (!apiDesigner?.id || !apiEnabled) return;
    let cancelled = false;
    fetch(`/api/designers/${encodeURIComponent(apiDesigner.id)}/follow`)
      .then((r) => r.json())
      .then((body) => {
        if (cancelled || !body?.ok) return;
        setFollowSeed({
          following: Boolean(body.data?.following),
          followersCount: Number(body.data?.followersCount || 0),
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [apiDesigner?.id, apiEnabled]);

  const {
    following: isFollowing,
    followersCount,
    toggle: toggleFollow,
  } = useFollow({
    designerId: designer?.id,
    initialFollowing: followSeed?.following,
    initialFollowers: followSeed?.followersCount,
  });

  useEffect(() => {
    if (!designer) return;
    if (!isRemoteApiEnabled()) {
      const designerPosts = FEED_POSTS.filter(
        (post) =>
          post.designerId === designer.id ||
          post.designerName.toLowerCase() === designer.name.toLowerCase()
      );
      setFeedPosts(
        designerPosts.length > 0 ? designerPosts : FEED_POSTS.slice(0, 4)
      );
      return;
    }
    let cancelled = false;
    listFeed({ limit: 40 })
      .then((page) => {
        if (cancelled) return;
        const filtered = page.items.filter(
          (post) =>
            post.designerId === designer.id ||
            post.designerName.toLowerCase() === designer.name.toLowerCase()
        );
        setFeedPosts(filtered);
      })
      .catch(() => {
        if (!cancelled) setFeedPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [designer]);

  if (apiEnabled && apiLoading) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen flex items-center justify-center px-6 bg-[#FDFCF8]">
          <p className="font-sans text-sm text-[#7A7A7A]">Loading house…</p>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!designer) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen flex items-center justify-center px-6 bg-[#FDFCF8]">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase mb-3">
              House Not Found
            </h1>
            <Link href="/store" className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] underline">
              Browse All Houses
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const products = apiEnabled
    ? apiProducts
    : allProducts.filter(
        (p) =>
          p.designerId === designer.id ||
          p.designerName.toLowerCase() === designer.name.toLowerCase()
      );

  const displayPosts = feedPosts;

  return (
    <>
      <TopBar />

      <main className="min-h-screen pb-16 bg-[#FDFCF8]">
        {/* Full-bleed Banner */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[16/7] bg-[#D5DBE5]">
          <Image
            src={designer.banner}
            alt={designer.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Back button */}
          <Link
            href="/store"
            className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full shadow-md text-white active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
        </div>

        {/* Profile Header Info */}
        <div className="px-4 pt-3 pb-6 bg-[#FDFCF8]">
          {/* Top Row: Circular Logo + Follow Button */}
          <div className="flex items-center justify-between gap-4 mb-3">
            {/* Logo Avatar */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#2B2B2B] border-4 border-[#FDFCF8] -mt-10 shadow-lg flex-shrink-0 flex items-center justify-center">
              <Image
                src={designer.logo}
                alt={designer.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>

            <div className="flex items-center gap-2">
              <ShareButton
                title={designer.name}
                text={designer.bio}
                path={`/designer/${designer.handle}`}
                className="px-3 py-2 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider border border-gray-300 bg-white text-[#2B2B2B]"
              />
              <button
                type="button"
                onClick={() => void toggleFollow().catch(() => undefined)}
                className={`px-5 py-2 rounded-full font-sans text-xs font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                  isFollowing
                    ? "bg-white text-[#2B2B2B] border border-gray-300"
                    : "bg-[#2B2B2B] text-white"
                }`}
              >
                {isFollowing ? "Following ✓" : "Follow"}
              </button>
            </div>
          </div>

          {/* Brand Name Row */}
          <div className="flex items-center gap-1.5 mb-1">
            <h1 className="font-display text-2xl font-extrabold text-[#2B2B2B] uppercase tracking-tight">
              {designer.name}
            </h1>
            {designer.verified && (
              <svg className="w-5 h-5 text-[#2B2B2B]" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Location field */}
          <div className="flex items-center gap-1.5 text-[#7A7A7A] font-sans text-xs font-semibold mb-2">
            <svg className="w-3.5 h-3.5 text-[#7A7A7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{designer.location}</span>
          </div>

          <p className="font-sans text-xs text-[#4A4A4A] mb-3">
            <span className="font-bold text-[#2B2B2B]">
              {followersCount > 0
                ? followersCount.toLocaleString("en-IN")
                : designer.followersCount || "0"}
            </span>{" "}
            followers
          </p>

          {/* Bio text & Website Link */}
          <p className="font-sans text-xs text-[#4A4A4A] leading-relaxed mb-2 font-medium">
            {designer.foundingStory}
          </p>

          {designer.website && (
            <a
              href={`https://${designer.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-sans text-xs font-bold text-[#2B2B2B] underline hover:text-black mb-4"
            >
              <span>🌐 {designer.website}</span>
            </a>
          )}

          {/* Signature Techniques Badges */}
          {designer.signatureTechniques.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {designer.signatureTechniques.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 bg-white/80 border border-gray-300 font-sans text-[10px] font-bold text-[#4A4A4A] rounded-full shadow-2xs"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabbed Navigation Bar: Posts | Shop */}
        <div className="sticky top-[var(--top-bar-height)] z-30 bg-[#FDFCF8] border-y border-white/50 shadow-xs">
          <div className="flex items-center justify-around font-sans text-xs font-extrabold uppercase tracking-wider">
            {/* Posts Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-3.5 text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "posts"
                  ? "border-[#2B2B2B] text-[#2B2B2B] bg-white/40"
                  : "border-transparent text-[#7A7A7A]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zm0 9.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25v2.25A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
              </svg>
              <span>POSTS ({displayPosts.length})</span>
            </button>

            {/* Shop Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("shop")}
              className={`flex-1 py-3.5 text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "shop"
                  ? "border-[#2B2B2B] text-[#2B2B2B] bg-white/40"
                  : "border-transparent text-[#7A7A7A]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span>SHOP ({products.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {/* TAB 1: POSTS GRID (Instagram-style visual grid with interactive Like, Wishlist, Add to Cart icons) */}
          {activeTab === "posts" && (
            <div className="grid grid-cols-2 gap-4">
              {displayPosts.map((post) => (
                <DesignerGridPost
                  key={post.id}
                  post={post}
                  designerName={designer.name}
                  shopProduct={
                    products.find((p) => p.id === post.productTag?.productId) ||
                    products[0] ||
                    null
                  }
                />
              ))}
            </div>
          )}

          {/* TAB 2: SHOP CATALOG GRID */}
          {activeTab === "shop" && (
            <div>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="font-sans text-sm text-[#7A7A7A] mb-2 font-medium">
                    No products listed under this house yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}
