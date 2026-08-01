"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { DesignerGridPost } from "@/components/designer/DesignerGridPost";
import { ShareButton } from "@/components/ShareButton";
import { DESIGNERS, FEED_POSTS, PRODUCTS } from "@/lib/mock-data";
import { useStorefrontDesigner } from "@/hooks/useStorefrontCatalog";
import { listFeed, isRemoteApiEnabled } from "@/lib/api/catalog";
import { useFollow } from "@/hooks/useSocial";
import { useDesignerLookbooks } from "@/hooks/useLuxury";
import { LookbookCard } from "@/components/luxury/LookbookCard";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import type { FeedPostData } from "@/lib/types";
import { getDesignerUrl } from "@/lib/routes";

interface PageProps {
  params: Promise<{ handle: string }>;
}

function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

export default function DesignerProfilePage({ params }: PageProps) {
  const { handle } = use(params);
  const {
    designer: apiDesigner,
    products: apiProducts,
    enabled: apiEnabled,
    loading: apiLoading,
  } = useStorefrontDesigner(handle);

  const mockDesigner = DESIGNERS.find(
    (d) =>
      d.handle.toLowerCase() === handle.toLowerCase() ||
      d.name.toLowerCase() === handle.toLowerCase()
  );
  const designer = apiEnabled ? apiDesigner : mockDesigner;

  const [activeTab, setActiveTab] = useState<"posts" | "shop" | "lookbooks" | "story">(
    "posts"
  );
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

  const {
    items: lookbooks,
    loading: lookbooksLoading,
  } = useDesignerLookbooks(designer?.id);

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
    listFeed({ limit: 40, designerId: designer.id })
      .then((page) => {
        if (cancelled) return;
        const filtered = page.items.filter(
          (post) =>
            post.designerId === designer.id ||
            post.designerName.toLowerCase() === designer.name.toLowerCase()
        );
        if (filtered.length > 0) {
          setFeedPosts(filtered);
        } else {
          listFeed({ limit: 4 })
            .then((fallback) => {
              if (!cancelled) setFeedPosts(fallback.items);
            })
            .catch(() => {
              if (!cancelled) setFeedPosts([]);
            });
        }
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
    : PRODUCTS.filter(
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
          {isValidImageUrl(designer.banner) ? (
            <Image
              src={designer.banner}
              alt={designer.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : null}
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
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#2B2B2B] border-4 border-[#FDFCF8] -mt-10 shadow-lg flex-shrink-0 flex items-center justify-center font-bold text-white text-lg">
              {isValidImageUrl(designer.logo) ? (
                <Image
                  src={designer.logo}
                  alt={designer.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                designer.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex items-center gap-2">
              <ShareButton
                title={designer.name}
                text={designer.bio}
                path={getDesignerUrl(designer.handle) ?? "/"}
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

          {(designer.studioLocation || designer.yearsExperience) && (
            <p className="font-sans text-[10px] uppercase tracking-wider text-[#A0A0A0] mb-2">
              {designer.studioLocation || designer.location}
              {designer.yearsExperience
                ? ` · ${designer.yearsExperience} years`
                : null}
            </p>
          )}

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
            <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
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

        {/* Tabbed Navigation Bar */}
        <div className="sticky top-[var(--top-bar-height)] z-30 bg-[#FDFCF8] border-y border-white/50 shadow-xs">
          <div className="flex items-center justify-around font-sans text-[10px] font-extrabold uppercase tracking-wider overflow-x-auto">
            {(
              [
                ["posts", `Posts (${displayPosts.length})`],
                ["shop", `Shop (${products.length})`],
                ["lookbooks", `Lookbooks (${lookbooks.length})`],
                ["story", "House"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex-1 min-w-[5.5rem] py-3.5 text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === id
                    ? "border-[#2B2B2B] text-[#2B2B2B] bg-white/40"
                    : "border-transparent text-[#7A7A7A]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === "posts" && (
            <div className="grid grid-cols-2 gap-4">
              {displayPosts.map((post) => (
                <DesignerGridPost
                  key={post.id}
                  post={post}
                  designerName={designer.name}
                  designerHandle={designer.handle}
                  shopProduct={
                    products.find((p) => p.id === post.productTag?.productId) ||
                    products[0] ||
                    null
                  }
                />
              ))}
            </div>
          )}

          {activeTab === "shop" && (
            <div>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <CatalogStatus
                  empty
                  emptyMessage="No pieces listed under this house yet."
                />
              )}
            </div>
          )}

          {activeTab === "lookbooks" && (
            <div>
              {lookbooksLoading ? (
                <CatalogStatus loading skeletonCount={2} />
              ) : lookbooks.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {lookbooks.map((lb) => (
                    <LookbookCard
                      key={lb.id}
                      lookbook={lb}
                      designerHandle={designer.handle}
                    />
                  ))}
                </div>
              ) : (
                <CatalogStatus
                  empty
                  emptyMessage="Lookbooks will appear when this house publishes a campaign."
                />
              )}
            </div>
          )}

          {activeTab === "story" && (
            <div className="space-y-6">
              {designer.designPhilosophy && (
                <section>
                  <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-2">
                    Design philosophy
                  </h2>
                  <p className="font-sans text-sm text-[#4A4A4A] leading-relaxed">
                    {designer.designPhilosophy}
                  </p>
                </section>
              )}
              {designer.awards && designer.awards.length > 0 && (
                <section>
                  <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-2">
                    Awards
                  </h2>
                  <ul className="space-y-1">
                    {designer.awards.map((a) => (
                      <li
                        key={a}
                        className="font-sans text-xs text-[#4A4A4A] border-b border-[#EBEBEB] py-2"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {designer.pressMentions && designer.pressMentions.length > 0 && (
                <section>
                  <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-2">
                    Press
                  </h2>
                  <ul className="space-y-3">
                    {designer.pressMentions.map((p) => (
                      <li key={`${p.outlet}-${p.title}`}>
                        <p className="font-sans text-sm text-[#2B2B2B] font-medium">
                          {p.title}
                        </p>
                        <p className="font-sans text-[10px] uppercase tracking-wider text-[#A0A0A0]">
                          {p.outlet}
                          {p.year ? ` · ${p.year}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {designer.editorialGallery && designer.editorialGallery.length > 0 && (
                <section>
                  <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-3">
                    Editorial gallery
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {designer.editorialGallery.slice(0, 4).map((src) => (
                      <div
                        key={src}
                        className="relative aspect-[3/4] bg-[#F0F0F0] overflow-hidden"
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="50vw"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {products.filter((p) => p.limitedEdition || p.editorsPick).length > 0 && (
                <section>
                  <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-3">
                    Signature pieces
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {products
                      .filter((p) => p.limitedEdition || p.editorsPick)
                      .slice(0, 4)
                      .map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}
