"use client";

import { memo, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import type { ViewerMediaItem } from "@/lib/media/types";
import { useMediaViewer } from "@/hooks/useMediaViewer";
import { MediaOverlay } from "./MediaOverlay";
import { MediaControls } from "./MediaControls";
import { ImageViewer } from "./ImageViewer";
import { VideoViewer } from "./VideoViewer";
import { ThumbnailStrip } from "./ThumbnailStrip";
import { GestureHandler } from "./GestureHandler";
import { ReelChrome } from "./ReelChrome";

export type MediaViewerProps = {
  open: boolean;
  media: ViewerMediaItem[];
  initialIndex?: number;
  syncUrl?: boolean;
  source?: string;
  title?: string;
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

  const onDoubleTapLike = useCallback(() => {
    if (continuous) {
      window.dispatchEvent(new CustomEvent("ds-reel-double-like"));
      return;
    }
    if (current?.type === "image") toggleZoomAt();
  }, [continuous, current?.type, toggleZoomAt]);

  const nextItem = queue[index + 1];
  const preloadUrl = nextItem?.type === "video" ? nextItem.url : null;
  const preloadUrls = [1, 2, 3]
    .map((offset) => {
      const m = queue[index + offset];
      return m?.type === "video" ? m.url : null;
    })
    .filter(Boolean) as string[];

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <MediaOverlay onBackdropClick={continuous ? undefined : onClose}>
      <div
        ref={setRootEl}
        className="relative flex flex-col w-full h-full outline-none bg-black"
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
          title={continuous ? undefined : title}
          minimal={continuous}
        />

        <GestureHandler
          className="flex-1 relative min-h-0"
          zoomed={isZoomed}
          axis={continuous ? "vertical" : "horizontal"}
          onSwipeLeft={continuous ? undefined : goNext}
          onSwipeRight={continuous ? undefined : goPrev}
          onSwipeUp={continuous ? goNext : undefined}
          onSwipeDown={continuous ? goPrev : undefined}
          onDoubleTap={onDoubleTapLike}
          onPinchZoom={continuous ? undefined : (d) => setZoom(zoom + d)}
          onWheelZoom={continuous ? undefined : (d) => setZoom(zoom + d)}
        >
          {current?.type === "video" ? (
            <VideoViewer
              key={current.id}
              item={current}
              isActive
              reelMode={continuous}
              preloadUrl={preloadUrl}
              preloadUrls={preloadUrls}
            />
          ) : current ? (
            <ImageViewer
              key={current.id}
              item={current}
              zoom={continuous ? 1 : zoom}
              isActive
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/60 text-sm font-sans">
              <span className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
          )}

          {continuous && current ? (
            <ReelChrome item={current} onCloseViewer={onClose} />
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
        ) : null}
      </div>
    </MediaOverlay>,
    document.body
  );
}

export const MediaViewer = memo(MediaViewerInner);
