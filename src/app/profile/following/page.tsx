"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

type FollowedHouse = {
  id: string;
  name: string;
  handle: string;
  logo: string;
  banner: string;
  bio: string;
  posts: Array<{ id: string; image: string; caption: string }>;
  products: Array<{ id: string; name: string; price: number; images: string[] }>;
};

export default function BuyerFollowingPage() {
  const [loading, setLoading] = useState(true);
  const [houses, setHouses] = useState<FollowedHouse[]>([]);

  async function fetchFollowing() {
    try {
      const res = await fetch("/api/follow");
      const body = await res.json();
      if (body?.ok && Array.isArray(body.data?.houses)) {
        setHouses(body.data.houses);
      }
    } catch {
      /* error */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFollowing();
  }, []);

  async function handleUnfollow(designerId: string) {
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designerId }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setHouses((prev) => prev.filter((h) => h.id !== designerId));
      }
    } catch {
      /* error */
    }
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-28 max-w-4xl mx-auto px-4 pt-6 space-y-6">
        <div>
          <Link href="/profile" className="text-xs font-bold text-stone hover:text-charcoal">
            ← Back to Profile
          </Link>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal mt-1">
            Followed Atelier Designer Houses
          </h1>
          <p className="text-xs text-stone mt-0.5">
            Your personalized feed stream of luxury designer houses, runway drops &amp; editorial stories
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-36 bg-mist rounded-3xl animate-pulse" />
            <div className="h-36 bg-mist rounded-3xl animate-pulse" />
          </div>
        ) : houses.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-cloud text-center space-y-4 shadow-xs">
            <span className="text-4xl block">✨</span>
            <h2 className="font-display text-lg font-bold uppercase text-charcoal">No Followed Houses Yet</h2>
            <p className="text-xs text-stone max-w-md mx-auto">
              Follow your favorite luxury couturiers and designer ateliers to receive instant drop updates and feed posts.
            </p>
            <Link
              href="/designers"
              className="inline-block px-6 py-3 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-black"
            >
              Explore Atelier Directory →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {houses.map((house) => (
              <div key={house.id} className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-cloud bg-mist shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={house.logo} alt={house.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <Link href={`/designer/${house.handle}`} className="font-display text-base font-bold text-charcoal hover:underline">
                        {house.name}
                      </Link>
                      <p className="text-xs text-stone font-mono">@{house.handle}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/designer/${house.handle}`}
                      className="px-4 py-2 border border-cloud text-charcoal font-sans text-xs font-bold uppercase rounded-full hover:bg-mist"
                    >
                      Visit Storefront ↗
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleUnfollow(house.id)}
                      className="px-4 py-2 bg-mist text-stone font-sans text-xs font-bold uppercase rounded-full hover:bg-cloud"
                    >
                      Following ✓
                    </button>
                  </div>
                </div>

                {/* Recent Feed Posts & Products */}
                {house.posts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-cloud">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">Latest Atelier Feed Posts</span>
                    <div className="grid grid-cols-3 gap-2">
                      {house.posts.map((post) => (
                        <div key={post.id} className="relative h-28 rounded-2xl overflow-hidden bg-mist border border-cloud">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
