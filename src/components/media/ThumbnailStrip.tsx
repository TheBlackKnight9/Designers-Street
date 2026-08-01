"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ViewerMediaItem } from "@/lib/media/types";
import { getOptimizedMediaUrl } from "@/lib/media/cloudinary-delivery";

type ThumbnailStripProps = {
  media: ViewerMediaItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

const THUMB_W = 56;
const GAP = 8;
const OVERSCAN = 4;

export function ThumbnailStrip({
  media,
  currentIndex,
  onSelect,
}: ThumbnailStripProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewport, setViewport] = useState(320);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewport(el.clientWidth));
    ro.observe(el);
    setViewport(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const target =
      currentIndex * (THUMB_W + GAP) - viewport / 2 + THUMB_W / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [currentIndex, viewport]);

  const { start, end } = useMemo(() => {
    const itemSize = THUMB_W + GAP;
    const first = Math.max(0, Math.floor(scrollLeft / itemSize) - OVERSCAN);
    const visible = Math.ceil(viewport / itemSize) + OVERSCAN * 2;
    return {
      start: first,
      end: Math.min(media.length, first + visible),
    };
  }, [scrollLeft, viewport, media.length]);

  const totalWidth = media.length * (THUMB_W + GAP);

  if (media.length <= 1) return null;

  return (
    <div
      ref={scrollerRef}
      className="w-full overflow-x-auto hide-scrollbar px-3 py-2"
      onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
      role="listbox"
      aria-label="Gallery thumbnails"
    >
      <div className="relative h-14" style={{ width: totalWidth }}>
        {media.slice(start, end).map((item, offset) => {
          const i = start + offset;
          const left = i * (THUMB_W + GAP);
          const active = i === currentIndex;
          const src =
            item.thumbnailUrl ||
            getOptimizedMediaUrl(
              {
                url: item.url,
                publicId: item.publicId,
                type: item.type,
              },
              "thumb"
            );
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={active}
              aria-label={`Media ${i + 1} of ${media.length}`}
              onClick={() => onSelect(i)}
              className={`absolute top-0 h-14 w-14 rounded-md overflow-hidden border-2 transition-all ${
                active ? "border-white scale-105" : "border-transparent opacity-70"
              }`}
              style={{ left }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {item.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-[10px]">
                  ▶
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
