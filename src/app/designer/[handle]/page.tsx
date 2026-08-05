"use client";

import { use, useEffect, useMemo, useState } from "react";
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
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import type { FeedPostData, Product, StoryItem } from "@/lib/types";
import { getDesignerUrl } from "@/lib/routes";
import { StoryViewer } from "@/components/home/StoryViewer";
import { sanitizeImageUrl, isValidImageUrl } from "@/lib/utils/image-url";

interface PageProps {
  params: Promise<{ handle: string }>;
}

type ProfileTab = "store" | "posts";
type GenderFilter = "all" | "women" | "men";

function matchesGender(product: Product | null | undefined, gender: GenderFilter) {
  if (gender === "all" || !product) return true;
  return product.gender === gender || product.gender === "unisex";
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

  const [activeTab, setActiveTab] = useState<ProfileTab>("store");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [feedPosts, setFeedPosts] = useState<FeedPostData[]>([]);
  const [designerStories, setDesignerStories] = useState<StoryItem[]>([]);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set());
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

  const allProducts = useMemo(() => {
    if (!designer) return [] as Product[];
    return apiEnabled
      ? apiProducts
      : PRODUCTS.filter(
          (p) =>
            p.designerId === designer.id ||
            p.designerName.toLowerCase() === designer.name.toLowerCase()
        );
  }, [apiEnabled, apiProducts, designer]);

  const commercialProducts = useMemo(
    () => allProducts.filter((p) => (p as { listingType?: string }).listingType !== "CONCEPT_ART"),
    [allProducts]
  );

  const filteredProducts = useMemo(
    () => commercialProducts.filter((p) => matchesGender(p, genderFilter)),
    [commercialProducts, genderFilter]
  );

  const filteredFeedPosts = useMemo(() => {
    if (genderFilter === "all") return feedPosts;
    return feedPosts.filter((post) => {
      const productId = post.productTag?.productId;
      if (!productId) return true;
      const product = allProducts.find((p) => p.id === productId);
      return matchesGender(product, genderFilter);
    });
  }, [feedPosts, genderFilter, allProducts]);

  const hasStories = designerStories.length > 0;
  const allStoriesSeen =
    hasStories && designerStories.every((s) => seenStories.has(s.id));

  function openStories() {
    if (!hasStories) return;
    setActiveStoryIdx(0);
    setSeenStories((prev) => new Set(prev).add(designerStories[0].id));
  }

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

  return (
    <>
      <TopBar />

      <main className="min-h-screen pb-28 bg-paper">
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

        <div className="px-4 pt-3 pb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <button
              type="button"
              onClick={openStories}
              disabled={!hasStories}
              aria-label={hasStories ? `View ${designer.name} stories` : `${designer.name} profile`}
              className={`relative -mt-10 flex-shrink-0 rounded-full ${
                hasStories
                  ? allStoriesSeen
                    ? "story-ring--seen cursor-pointer"
                    : "story-ring cursor-pointer"
                  : "cursor-default"
              }`}
            >
              <div
                className={`relative w-20 h-20 rounded-full overflow-hidden bg-charcoal shadow-lg flex items-center justify-center font-bold text-paper text-lg ${
                  hasStories ? "border-2 border-paper" : "border-4 border-paper"
                }`}
              >
                {isValidImageUrl(designer.logo) ? (
                  <Image src={sanitizeImageUrl(designer.logo)} alt={designer.name} fill className="object-cover" sizes="80px" />
                ) : (
                  designer.name.charAt(0).toUpperCase()
                )}
              </div>
            </button>

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
          </div>

          <p className="text-xs text-stone font-semibold mb-2">
            📍 {designer.location} ·{" "}
            <strong className="text-charcoal">
              {followersCount > 0 ? followersCount.toLocaleString() : designer.followersCount || "0"}
            </strong>{" "}
            followers
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

        <div className="sticky top-14 z-30 bg-paper/90 backdrop-blur-md border-y border-cloud shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center font-sans text-[10px] font-bold uppercase tracking-wider">
            {(
              [
                ["store", `Store (${filteredProducts.length})`],
                ["posts", `Feed (${filteredFeedPosts.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex-1 py-3.5 text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === id ? "border-charcoal text-charcoal font-black" : "border-transparent text-stone"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 pt-3">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
            {(["all", "women", "men"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenderFilter(g)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase transition-colors ${
                  genderFilter === g ? "ds-chip-active" : "ds-chip"
                }`}
              >
                {g === "all" ? "All" : g === "women" ? "Women" : "Men"}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          {activeTab === "store" && (
            <div>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <CatalogStatus
                  empty
                  emptyMessage={
                    genderFilter === "all"
                      ? "No commercial ready-to-wear pieces listed under this house yet."
                      : `No ${genderFilter}'s pieces listed under this house yet.`
                  }
                />
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <div>
              {filteredFeedPosts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredFeedPosts.map((post) => (
                    <DesignerGridPost
                      key={post.id}
                      post={post}
                      designerName={designer.name}
                      designerHandle={designer.handle}
                      shopProduct={allProducts.find((p) => p.id === post.productTag?.productId) || null}
                    />
                  ))}
                </div>
              ) : (
                <CatalogStatus
                  empty
                  emptyMessage={
                    genderFilter === "all"
                      ? "No feed posts from this house yet."
                      : `No ${genderFilter}'s feed posts from this house yet.`
                  }
                />
              )}
            </div>
          )}
        </div>
      </main>

      {activeStoryIdx !== null && designerStories[activeStoryIdx] && (
        <StoryViewer
          story={designerStories[activeStoryIdx]}
          onClose={() => setActiveStoryIdx(null)}
          onNext={() => {
            if (activeStoryIdx < designerStories.length - 1) {
              const next = activeStoryIdx + 1;
              setActiveStoryIdx(next);
              setSeenStories((prev) => new Set(prev).add(designerStories[next].id));
            } else {
              setActiveStoryIdx(null);
            }
          }}
        />
      )}
    </>
  );
}
