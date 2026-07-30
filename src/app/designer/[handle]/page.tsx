"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { FEED_POSTS } from "@/lib/mock-data";
import { useData } from "@/context/DataContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useOpenMediaViewer } from "@/context/MediaViewerContext";
import { feedPostToViewerMedia } from "@/lib/media";
import { useStorefrontDesigner } from "@/hooks/useStorefrontCatalog";
import { listFeed, isRemoteApiEnabled } from "@/lib/api/catalog";
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [feedPosts, setFeedPosts] = useState<FeedPostData[]>([]);

  const { isWished, toggle: toggleWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { openMediaViewer } = useOpenMediaViewer();

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

  const togglePostLike = (postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

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

            {/* Prominent Follow Button */}
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-5 py-2 rounded-full font-sans text-xs font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                isFollowing
                  ? "bg-white text-[#2B2B2B] border border-gray-300"
                  : "bg-[#2B2B2B] text-white"
              }`}
            >
              {isFollowing ? "Following ✓" : "Follow"}
            </button>
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
          <div className="flex items-center gap-1.5 text-[#7A7A7A] font-sans text-xs font-semibold mb-3">
            <svg className="w-3.5 h-3.5 text-[#7A7A7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{designer.location}</span>
          </div>

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
              {displayPosts.map((post) => {
                const liked = !!likedPosts[post.id];
                const postProduct = products[0];

                return (
                  <div
                    key={post.id}
                    className="flex flex-col bg-[#FDFCF8] rounded-2xl overflow-hidden neu-raised-sm border border-white/40 group"
                  >
                    {/* High-res Image */}
                    <div className="relative aspect-[4/5] w-full bg-[#D5DBE5]">
                      <button
                        type="button"
                        className="absolute inset-0 block w-full h-full cursor-zoom-in"
                        onClick={() => {
                          const media = feedPostToViewerMedia(post);
                          const videoIdx = media.findIndex(
                            (m) => m.type === "video"
                          );
                          openMediaViewer({
                            media,
                            initialIndex: videoIdx >= 0 ? videoIdx : 0,
                            continuous: videoIdx >= 0 ? true : undefined,
                            source: "designer-profile",
                          });
                        }}
                        aria-label="Open media viewer"
                      >
                        <Image
                          src={post.image}
                          alt={post.caption}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-103 pointer-events-none"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      </button>

                      {/* Tag pill overlay */}
                      {post.tag && (
                        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/70 backdrop-blur-md text-white rounded-full pointer-events-none">
                          <span className="font-sans text-[8px] font-bold uppercase tracking-wider">
                            {post.tag}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Action Bar below image: Like, Wishlist, Add to Cart */}
                    <div className="px-3 py-2 flex items-center justify-between bg-white/50 border-t border-white/40">
                      {/* Like (Heart) */}
                      <button
                        type="button"
                        onClick={() => togglePostLike(post.id)}
                        className="flex items-center gap-1 text-[#2B2B2B] active:scale-90 transition-transform cursor-pointer"
                        aria-label="Like post"
                      >
                        <svg
                          className={`w-4 h-4 transition-colors ${
                            liked ? "fill-red-500 text-red-500" : "fill-none text-[#2B2B2B]"
                          }`}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <span className="font-sans text-[10px] font-bold">
                          {liked ? (post.likesCount || 1420) + 1 : post.likesCount || 1420}
                        </span>
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Wishlist (Bookmarked Heart) */}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(postProduct ? postProduct.id : post.id)}
                          className="text-[#2B2B2B] active:scale-90 transition-transform cursor-pointer"
                          aria-label="Wishlist"
                        >
                          <svg
                            className={`w-4 h-4 transition-colors ${
                              isWished(postProduct ? postProduct.id : post.id)
                                ? "fill-[#2B2B2B] text-[#2B2B2B]"
                                : "fill-none text-[#2B2B2B]"
                            }`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                          </svg>
                        </button>

                        {/* Add to Cart (Shopping Cart) */}
                        <button
                          type="button"
                          onClick={() => {
                            const item = postProduct || {
                              id: post.id,
                              name: post.caption,
                              price: 78000,
                              images: [post.image],
                            };
                            addToCart({
                              productId: item.id,
                              name: item.name,
                              brand: designer.name,
                              price: item.price || 78000,
                              size: "M",
                              image: item.images ? item.images[0] : post.image,
                            });
                          }}
                          className="text-[#2B2B2B] active:scale-90 transition-transform cursor-pointer p-1 rounded-full hover:bg-white"
                          aria-label="Add to cart"
                        >
                          <svg className="w-4 h-4 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
