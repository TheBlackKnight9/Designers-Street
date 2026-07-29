"use client";

import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { StoriesStrip } from "@/components/home/StoriesStrip";
import { FeedPost } from "@/components/home/FeedPost";
import { FEED_POSTS } from "@/lib/mock-data";

export default function FeedPage() {
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
          {FEED_POSTS.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
