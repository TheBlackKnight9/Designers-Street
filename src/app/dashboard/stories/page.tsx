"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/dashboard/Toast";
import { sanitizeImageUrl } from "@/lib/utils/image-url";

type Story = {
  id: string;
  label: string;
  expiresAt: string | null;
  createdAt: string;
  slides: {
    id: string;
    image: string;
    caption: string | null;
    ctaLabel: string | null;
  }[];
};

export default function DashboardStoriesPage() {
  const { push } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchStories() {
    try {
      const res = await fetch("/api/dashboard/stories");
      const data = await res.json();
      if (data?.ok && Array.isArray(data.data?.stories)) {
        setStories(data.data.stories);
      }
    } catch {
      push("Failed to load stories", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Instagram-Style Stories Builder
          </h1>
          <p className="text-xs text-stone mt-1">
            Create multi-slide ephemeral stories and highlights visible in customer feed trays
          </p>
        </div>

        <Link
          href="/dashboard/stories/new"
          className="px-5 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-black transition-colors"
        >
          + Create New Story
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="h-64 rounded-2xl bg-mist animate-pulse" />
          <div className="h-64 rounded-2xl bg-mist animate-pulse" />
        </div>
      ) : stories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-cloud bg-mist/30 space-y-3">
          <p className="text-sm font-semibold text-charcoal">No stories created yet</p>
          <p className="text-xs text-stone">Share ephemeral 24h behind-the-scenes slides or highlight drops</p>
          <Link
            href="/dashboard/stories/new"
            className="px-6 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full inline-block"
          >
            Create Your First Story
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-3xl border border-cloud p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-sm font-bold text-charcoal uppercase">
                    {story.label}
                  </h2>
                  <p className="text-[10px] text-stone mt-0.5">
                    {story.expiresAt ? `Expires in 24h` : "Permanent Highlight"} · {story.slides.length} slides
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-gold/20 text-gold-dark text-[9px] font-extrabold uppercase rounded-full">
                  Active Story
                </span>
              </div>

              {/* Slides Grid Preview */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {story.slides.slice(0, 3).map((slide) => (
                  <div key={slide.id} className="relative aspect-9/16 rounded-xl overflow-hidden border border-cloud bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sanitizeImageUrl(slide.image)} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
