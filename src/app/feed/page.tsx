"use client";

import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { StoriesStrip } from "@/components/home/StoriesStrip";
import { FeedPost } from "@/components/home/FeedPost";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import { useStorefrontFeed } from "@/hooks/useStorefrontCatalog";

const SORTS = [
  { id: "recent", label: "Recent" },
  { id: "trending", label: "Trending" },
  { id: "popular", label: "Popular" },
  { id: "following", label: "Following" },
] as const;

type FeedSort = (typeof SORTS)[number]["id"];

export default function FeedPage() {
  const [sort, setSort] = useState<FeedSort>("recent");
  const {
    posts,
    loading,
    error,
    reload,
    hasMore,
    loadMore,
    loadingMore,
  } = useStorefrontFeed(8, sort);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-28 bg-transparent">
        <header className="px-5 pt-8 pb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone mb-2">
              Editorial
            </p>
            <h1 className="font-sans text-[1.75rem] font-extrabold text-charcoal tracking-tight leading-none">
              Feed
            </h1>
            <p className="mt-2 text-[13px] text-stone leading-relaxed">
              Runway drops, house stories &amp; atelier films.
            </p>
          </div>
          <span className="mb-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ds-chip text-[9px] font-bold uppercase tracking-[0.14em]">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze animate-pulse" />
            Live
          </span>
        </header>

        <div
          className="px-5 pb-3 flex gap-2 overflow-x-auto hide-scrollbar"
          role="tablist"
          aria-label="Feed sort"
        >
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={sort === s.id}
              onClick={() => setSort(s.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                sort === s.id ? "ds-chip-active" : "ds-chip"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="border-y border-[var(--border-subtle)] bg-transparent">
          <StoriesStrip />
        </div>

        <div className="py-3 space-y-5">
          {loading || error || posts.length === 0 ? (
            <CatalogStatus
              loading={loading}
              error={error}
              empty={!loading && !error && posts.length === 0}
              emptyMessage={
                sort === "following"
                  ? "Follow designer houses to fill this feed."
                  : "No drops in the feed yet."
              }
              onRetry={reload}
              skeletonCount={2}
            />
          ) : (
            <>
              {posts.map((post) => (
                <FeedPost key={post.id} post={post} />
              ))}
              <div ref={sentinelRef} className="h-8" aria-hidden />
              {loadingMore ? (
                <p className="text-center text-[10px] uppercase tracking-[0.16em] text-stone pb-4">
                  Loading more…
                </p>
              ) : null}
            </>
          )}
        </div>
      </main>
    </>
  );
}
