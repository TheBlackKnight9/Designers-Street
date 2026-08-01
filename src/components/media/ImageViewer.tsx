"use client";

import { useRef, useState } from "react";
import type { ViewerMediaItem } from "@/lib/media/types";
import { getOptimizedMediaUrl } from "@/lib/media/cloudinary-delivery";

type ImageViewerProps = {
  item: ViewerMediaItem;
  zoom: number;
  isActive: boolean;
};

export function ImageViewer({ item, zoom, isActive }: ImageViewerProps) {
  const [failed, setFailed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null
  );

  const tier = zoom > 1.2 ? "full" : "medium";
  const panOffset = zoom <= 1 ? { x: 0, y: 0 } : pan;

  const src = failed
    ? item.url
    : getOptimizedMediaUrl(
        { url: item.url, publicId: item.publicId, type: "image" },
        tier
      );

  const thumb = getOptimizedMediaUrl(
    { url: item.url, publicId: item.publicId, type: "image" },
    "thumb"
  );

  if (!isActive) return null;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
      onPointerDown={(e) => {
        if (zoom <= 1) return;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        drag.current = {
          x: e.clientX,
          y: e.clientY,
          px: panOffset.x,
          py: panOffset.y,
        };
      }}
      onPointerMove={(e) => {
        if (!drag.current || zoom <= 1) return;
        setPan({
          x: drag.current.px + (e.clientX - drag.current.x),
          y: drag.current.py + (e.clientY - drag.current.y),
        });
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-contain opacity-40 blur-md scale-105 pointer-events-none"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={item.alt || "Media"}
        className="relative max-w-full max-h-full object-contain select-none will-change-transform transition-opacity duration-200"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          cursor: zoom > 1 ? "grab" : "zoom-in",
        }}
        draggable={false}
        onError={() => {
          if (!failed) setFailed(true);
        }}
      />
      {failed && (
        <div className="absolute bottom-24 left-0 right-0 text-center">
          <p className="text-white/80 text-xs font-sans mb-2">Image failed to load</p>
          <button
            type="button"
            className="px-3 py-1.5 bg-white/20 text-white text-xs rounded-full"
            onClick={() => setFailed(false)}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
