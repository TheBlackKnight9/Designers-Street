"use client";

import { useEffect, useRef } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { StoriesStrip } from "@/components/home/StoriesStrip";
import { FeedPost } from "@/components/home/FeedPost";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import { useStorefrontFeed } from "@/hooks/useStorefrontCatalog";

export default function FeedPage() {
  const {
    posts,
    loading,
    error,
    reload,
    hasMore,
    loadMore,
    loadingMore,
  } = useStorefrontFeed(8);
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
      <main className="min-h-screen pb-16 bg-[#FDFCF8]">
        {/* Feed Header info */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
              The Feed
            </h1>
            <p className="font-sans text-xs text-[#7A7A7A] mt-0.5">
              Live drops, runway edits &amp; designer house stories
            </p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#2B2B2B] text-white rounded-full neu-raised-sm">
            Live
          </span>
        </div>

        {/* Stories Strip */}
        <div className="border-y border-white/40 my-2 bg-[#FDFCF8]">
          <StoriesStrip />
        </div>

        {/* Feed Posts */}
        <div className="py-2 space-y-4">
          {loading || error || posts.length === 0 ? (
            <CatalogStatus
              loading={loading}
              error={error}
              empty={!loading && !error && posts.length === 0}
              emptyMessage="No drops in the feed yet."
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
                <p className="text-center font-sans text-[10px] uppercase tracking-wider text-[#A0A0A0] pb-4">
                  Loading more…
                </p>
              ) : null}
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
