"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { ProductCard } from "@/components/ui/ProductCard";
import { DesignerGridPost } from "@/components/designer/DesignerGridPost";
import { ShareButton } from "@/components/ShareButton";
import { DESIGNERS, FEED_POSTS, PRODUCTS, STORIES } from "@/lib/mock-data";
import { useStorefrontDesigner } from "@/hooks/useStorefrontCatalog";
import { listFeed, isRemoteApiEnabled } from "@/lib/api/catalog";
import { useFollow } from "@/hooks/useSocial";
import { useDesignerLookbooks } from "@/hooks/useLuxury";
import { LookbookCard } from "@/components/luxury/LookbookCard";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import type { FeedPostData, StoryItem } from "@/lib/types";
import { getDesignerUrl } from "@/lib/routes";
import { StoryViewer } from "@/components/home/StoryViewer";
import { sanitizeImageUrl, isValidImageUrl } from "@/lib/utils/image-url";

interface PageProps {
  params: Promise<{ handle: string }>;
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

  const [activeTab, setActiveTab] = useState<"store" | "concept_vault" | "posts" | "lookbooks" | "story">("store");
  const [feedPosts, setFeedPosts] = useState<FeedPostData[]>([]);
  const [designerStories, setDesignerStories] = useState<StoryItem[]>([]);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
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

  // Fetch designer stories
  useEffect(() => {
    if (!designer?.id) return;
    let cancelled = false;
    fetch(`/api/designers/${encodeURIComponent(designer.id)}/stories`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        const items = res?.data || res?.stories || [];
        if (Array.isArray(items) && items.length > 0) {
          setDesignerStories(items);
        } else {
          // Fallback to mock stories matching designer
          const matched = STORIES.filter(
            (s) =>
              s.designerId === designer.id ||
              s.designerName?.toLowerCase() === designer.name.toLowerCase()
          );
          setDesignerStories(matched);
        }
      })
      .catch(() => {
        if (!cancelled) setDesignerStories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [designer]);

  const {
    following: isFollowing,
    followersCount,
    toggle: toggleFollow,
  } = useFollow({
    designerId: designer?.id,
    initialFollowing: followSeed?.following,
    initialFollowers: followSeed?.followersCount,
  });

  const { items: lookbooks, loading: lookbooksLoading } = useDesignerLookbooks(designer?.id);

  useEffect(() => {
    if (!designer) return;
    if (!isRemoteApiEnabled()) {
      const designerPosts = FEED_POSTS.filter(
        (post) =>
          post.designerId === designer.id ||
          post.designerName.toLowerCase() === designer.name.toLowerCase()
      );
      setFeedPosts(designerPosts.length > 0 ? designerPosts : FEED_POSTS.slice(0, 4));
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
        if (filtered.length > 0) setFeedPosts(filtered);
        else {
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
        <main className="min-h-screen flex items-center justify-center px-6 bg-paper">
          <p className="font-sans text-xs font-bold text-stone animate-pulse">Loading house profile…</p>
        </main>
      </>
    );
  }

  if (!designer) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen flex items-center justify-center px-6 bg-paper">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-charcoal uppercase mb-3">
              House Not Found
            </h1>
            <Link href="/store" className="text-xs font-bold uppercase tracking-wider text-charcoal underline">
              Explore Designer Stores
            </Link>
          </div>
        </main>
      </>
    );
  }

  const allProducts = apiEnabled
    ? apiProducts
    : PRODUCTS.filter(
        (p) =>
          p.designerId === designer.id ||
          p.designerName.toLowerCase() === designer.name.toLowerCase()
      );

  const commercialProducts = allProducts.filter((p) => (p as any).listingType !== "CONCEPT_ART");
  const conceptProducts = allProducts.filter((p) => (p as any).listingType === "CONCEPT_ART");

  return (
    <>
      <TopBar />

      <main className="min-h-screen pb-28 bg-paper">
        {/* Full-bleed Banner */}
        <div className="relative w-full aspect-[16/7] bg-mist">
          {isValidImageUrl(designer.banner) ? (
            <Image src={sanitizeImageUrl(designer.banner)} alt={designer.name} fill className="object-cover" priority sizes="100vw" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <Link
            href="/store"
            className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white shadow-md"
          >
            ←
          </Link>
        </div>

        {/* Profile Header Info */}
        <div className="px-4 pt-3 pb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div
              onClick={() => designerStories.length > 0 && setActiveStoryIdx(0)}
              className={`relative w-20 h-20 rounded-full overflow-hidden bg-charcoal -mt-10 shadow-lg flex-shrink-0 flex items-center justify-center font-bold text-paper text-lg ${
                designerStories.length > 0 ? "ring-4 ring-gold cursor-pointer" : "border-4 border-paper"
              }`}
            >
              {isValidImageUrl(designer.logo) ? (
                <Image src={sanitizeImageUrl(designer.logo)} alt={designer.name} fill className="object-cover" sizes="80px" />
              ) : (
                designer.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex items-center gap-2">
              <ShareButton
                title={designer.name}
                text={designer.bio}
                path={getDesignerUrl(designer.handle) ?? "/"}
                className="px-3 py-2 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider border border-cloud bg-white text-charcoal"
              />
              <button
                type="button"
                onClick={() => void toggleFollow().catch(() => undefined)}
                className={`px-5 py-2 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                  isFollowing ? "bg-white text-charcoal border border-cloud" : "bg-charcoal text-paper"
                }`}
              >
                {isFollowing ? "Following ✓" : "Follow"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <h1 className="font-display text-2xl font-bold text-charcoal uppercase tracking-wide">
              {designer.name}
            </h1>
            {designer.verified && (
              <span className="text-xs bg-charcoal text-paper px-1.5 py-0.5 rounded-full font-bold">✓</span>
            )}
            {designerStories.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveStoryIdx(0)}
                className="ml-2 px-2.5 py-0.5 bg-gold/20 text-gold-dark text-[10px] font-extrabold uppercase rounded-full border border-gold/40"
              >
                ▶ Watch Story ({designerStories.length})
              </button>
            )}
          </div>

          <p className="text-xs text-stone font-semibold mb-2">
            📍 {designer.location} · <strong className="text-charcoal">{followersCount > 0 ? followersCount.toLocaleString() : designer.followersCount || "0"}</strong> followers
          </p>

          <p className="text-xs text-charcoal leading-relaxed mb-3">{designer.foundingStory || designer.bio}</p>

          {designer.signatureTechniques && designer.signatureTechniques.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {designer.signatureTechniques.map((t) => (
                <span key={t} className="px-3 py-1 bg-white border border-cloud text-[10px] font-bold uppercase text-charcoal rounded-full shadow-2xs">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="sticky top-14 z-30 bg-paper/90 backdrop-blur-md border-y border-cloud shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-around font-sans text-[10px] font-bold uppercase tracking-wider overflow-x-auto">
            {(
              [
                ["store", `Store (${commercialProducts.length})`],
                ["concept_vault", `Concept Vault (${conceptProducts.length})`],
                ["lookbooks", `Lookbooks (${lookbooks.length})`],
                ["posts", `Feed (${feedPosts.length})`],
                ["story", `Atelier Story (${designerStories.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex-1 min-w-[6rem] py-3.5 text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === id ? "border-charcoal text-charcoal font-black" : "border-transparent text-stone"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto p-4">
          {activeTab === "store" && (
            <div>
              {commercialProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commercialProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <CatalogStatus empty emptyMessage="No commercial ready-to-wear pieces listed under this house yet." />
              )}
            </div>
          )}

          {activeTab === "concept_vault" && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-cloud text-xs text-stone space-y-1">
                <span className="font-display font-bold text-sm uppercase text-charcoal block">🎨 Digital Concept Vault</span>
                <p>Exclusive runway previews, digital sketches, and prototype concepts. Request bespoke quotes or express interest before production.</p>
              </div>

              {conceptProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {conceptProducts.map((p) => (
                    <div key={p.id} className="bg-white p-3 rounded-2xl border border-cloud space-y-2 shadow-xs">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-mist">
                        <Image src={sanitizeImageUrl(p.images[0])} alt={p.name} fill className="object-cover" sizes="200px" />
                        <span className="absolute top-2 left-2 bg-charcoal/90 backdrop-blur-xs text-paper text-[9px] font-bold uppercase px-2 py-1 rounded-md">
                          🎨 Concept Art
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-charcoal truncate">{p.name}</p>
                        <p className="text-[10px] text-stone mt-0.5">Est. Launch: {(p as any).estimatedLaunch || "Q4 2026"}</p>
                      </div>
                      <Link
                        href={`/product/${p.id}`}
                        className="block w-full py-2 bg-charcoal text-paper text-center text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-xs hover:bg-black"
                      >
                        Request Bespoke Quote →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <CatalogStatus empty emptyMessage="No concept art previews currently showcased in the vault." />
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {feedPosts.map((post) => (
                <DesignerGridPost
                  key={post.id}
                  post={post}
                  designerName={designer.name}
                  designerHandle={designer.handle}
                  shopProduct={allProducts.find((p) => p.id === post.productTag?.productId) || null}
                />
              ))}
            </div>
          )}

          {activeTab === "lookbooks" && (
            <div>
              {lookbooksLoading ? (
                <CatalogStatus loading skeletonCount={2} />
              ) : lookbooks.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {lookbooks.map((lb) => (
                    <LookbookCard key={lb.id} lookbook={lb} designerHandle={designer.handle} />
                  ))}
                </div>
              ) : (
                <CatalogStatus empty emptyMessage="Campaign lookbooks will appear when published." />
              )}
            </div>
          )}

          {activeTab === "story" && (
            <div className="space-y-6">
              {/* Published Ephemeral Stories & Highlights Section */}
              {designerStories.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-display text-sm font-bold uppercase tracking-wide text-charcoal">
                    Active House Stories &amp; Highlights
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {designerStories.map((story, i) => (
                      <div
                        key={story.id}
                        onClick={() => setActiveStoryIdx(i)}
                        className="group relative aspect-9/16 rounded-2xl overflow-hidden border border-cloud bg-black/5 cursor-pointer shadow-xs hover:shadow-md transition-all"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sanitizeImageUrl(story.slides?.[0]?.image)}
                          alt={story.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between text-white">
                          <span className="self-end px-2 py-0.5 bg-black/60 backdrop-blur-xs text-[9px] font-bold uppercase rounded-md">
                            {story.slides.length} Slides
                          </span>
                          <div>
                            <span className="text-[9px] font-bold uppercase text-gold block">
                              {designer.name}
                            </span>
                            <p className="font-display text-xs font-bold uppercase line-clamp-1">
                              {story.label}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Design Philosophy & Craft Details */}
              <div className="bg-white p-6 rounded-3xl border border-cloud space-y-4 text-xs text-charcoal leading-relaxed shadow-xs">
                <section className="space-y-1">
                  <h2 className="font-display text-sm font-bold uppercase text-charcoal">Design Philosophy</h2>
                  <p>{(designer as any).designPhilosophy || designer.bio}</p>
                </section>

                {designer.signatureTechniques && designer.signatureTechniques.length > 0 && (
                  <section className="space-y-2 pt-3 border-t border-cloud">
                    <h2 className="font-display text-sm font-bold uppercase text-charcoal">Craft Techniques</h2>
                    <div className="flex flex-wrap gap-2">
                      {designer.signatureTechniques.map((t) => (
                        <span key={t} className="px-3 py-1 bg-mist rounded-xl font-bold uppercase text-[10px] text-charcoal border border-cloud">
                          {t}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Story Viewer Modal */}
      {activeStoryIdx !== null && designerStories[activeStoryIdx] && (
        <StoryViewer
          story={designerStories[activeStoryIdx]}
          onClose={() => setActiveStoryIdx(null)}
          onNext={() => {
            if (activeStoryIdx < designerStories.length - 1) {
              setActiveStoryIdx(activeStoryIdx + 1);
            } else {
              setActiveStoryIdx(null);
            }
          }}
        />
      )}
    </>
  );
}
