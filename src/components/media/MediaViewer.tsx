"use client";

import { memo, useState } from "react";
import { createPortal } from "react-dom";
import type { ViewerMediaItem } from "@/lib/media/types";
import { useMediaViewer } from "@/hooks/useMediaViewer";
import { MediaOverlay } from "./MediaOverlay";
import { MediaControls } from "./MediaControls";
import { ImageViewer } from "./ImageViewer";
import { VideoViewer } from "./VideoViewer";
import { ThumbnailStrip } from "./ThumbnailStrip";
import { GestureHandler } from "./GestureHandler";

export type MediaViewerProps = {
  open: boolean;
  media: ViewerMediaItem[];
  initialIndex?: number;
  syncUrl?: boolean;
  source?: string;
  title?: string;
  /** Instagram-style continuous vertical discovery */
  continuous?: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
};

function MediaViewerInner({
  open,
  media,
  initialIndex = 0,
  syncUrl = false,
  source,
  title,
  continuous = false,
  onClose,
  onIndexChange,
}: MediaViewerProps) {
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const {
    index,
    current,
    queue,
    count,
    zoom,
    isZoomed,
    goNext,
    goPrev,
    goTo,
    setZoom,
    toggleZoomAt,
  } = useMediaViewer({
    media,
    initialIndex,
    open,
    syncUrl,
    source,
    continuous,
    onClose,
    onIndexChange,
    rootElement: rootEl,
  });

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <MediaOverlay onBackdropClick={onClose}>
      <div
        ref={setRootEl}
        className="relative flex flex-col w-full h-full outline-none"
        tabIndex={-1}
      >
        <MediaControls
          index={index}
          count={count}
          onClose={onClose}
          onPrev={goPrev}
          onNext={goNext}
          canPrev={index > 0}
          canNext={index < count - 1 || continuous}
          title={continuous ? title ?? "Discover" : title}
        />

        <GestureHandler
          className="flex-1 relative min-h-0"
          zoomed={isZoomed}
          axis={continuous ? "vertical" : "horizontal"}
          onSwipeLeft={continuous ? undefined : goNext}
          onSwipeRight={continuous ? undefined : goPrev}
          onSwipeUp={continuous ? goNext : undefined}
          onSwipeDown={continuous ? goPrev : undefined}
          onDoubleTap={() => {
            if (current?.type === "image") toggleZoomAt();
          }}
          onPinchZoom={continuous ? undefined : (d) => setZoom(zoom + d)}
          onWheelZoom={continuous ? undefined : (d) => setZoom(zoom + d)}
        >
          {current?.type === "video" ? (
            <VideoViewer key={current.id} item={current} isActive />
          ) : current ? (
            <ImageViewer
              key={current.id}
              item={current}
              zoom={continuous ? 1 : zoom}
              isActive
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/60 text-sm font-sans">
              No media available
            </div>
          )}

          {continuous ? (
            <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex justify-center">
              <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-white/70">
                Swipe for more
              </span>
            </div>
          ) : null}
        </GestureHandler>

        {!continuous ? (
          <div className="pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/80 to-transparent">
            <ThumbnailStrip
              media={queue}
              currentIndex={index}
              onSelect={goTo}
            />
          </div>
        ) : (
          <div className="pb-[max(0.5rem,env(safe-area-inset-bottom))]" />
        )}
      </div>
    </MediaOverlay>,
    document.body
  );
}

export const MediaViewer = memo(MediaViewerInner);
