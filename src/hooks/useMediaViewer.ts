"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ViewerMediaItem } from "@/lib/media/types";
import { trackMediaEvent } from "@/lib/media/media-analytics";
import { getOptimizedMediaUrl } from "@/lib/media/cloudinary-delivery";
import { getMediaRecommendationService } from "@/lib/media/recommendation";
import { recommendationSeedKey } from "@/lib/media/watch-progress";

export type UseMediaViewerArgs = {
  media: ViewerMediaItem[];
  initialIndex?: number;
  open: boolean;
  syncUrl?: boolean;
  source?: string;
  /** Instagram-style continuous discovery */
  continuous?: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  rootElement?: HTMLElement | null;
};

export type UseMediaViewerResult = {
  index: number;
  current: ViewerMediaItem | null;
  queue: ViewerMediaItem[];
  count: number;
  zoom: number;
  isZoomed: boolean;
  continuous: boolean;
  hasMore: boolean;
  goNext: () => void;
  goPrev: () => void;
  goTo: (i: number) => void;
  setZoom: (z: number) => void;
  resetZoom: () => void;
  toggleZoomAt: () => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function preloadImage(url: string) {
  if (typeof window === "undefined" || !url) return;
  const img = new window.Image();
  img.decoding = "async";
  img.src = url;
}

function preloadAdjacent(item: ViewerMediaItem | undefined) {
  if (!item) return;
  if (item.type === "image") {
    preloadImage(
      getOptimizedMediaUrl(
        { url: item.url, publicId: item.publicId, type: "image" },
        "medium"
      )
    );
  } else {
    // Poster / thumb for video metadata feel
    preloadImage(
      item.thumbnailUrl ||
        getOptimizedMediaUrl(
          { url: item.url, publicId: item.publicId, type: "video" },
          "thumb"
        )
    );
  }
}

export function syncMediaParam(i: number, syncUrl: boolean, remove = false) {
  if (!syncUrl || typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (remove) url.searchParams.delete("media");
  else url.searchParams.set("media", String(i));
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}

export function useMediaViewer({
  media,
  initialIndex = 0,
  open,
  syncUrl = false,
  source,
  continuous = false,
  onClose,
  onIndexChange,
  rootElement = null,
}: UseMediaViewerArgs): UseMediaViewerResult {
  const [queue, setQueue] = useState<ViewerMediaItem[]>(media);
  const count = queue.length;
  const safeInitial = clamp(initialIndex, 0, Math.max(0, count - 1));
  const [index, setIndex] = useState(safeInitial);
  const [zoom, setZoomState] = useState(1);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(continuous);
  const fetchingRef = useRef(false);
  const seedRef = useRef<ViewerMediaItem | null>(null);
  const wheelLock = useRef(0);

  const current = count > 0 ? queue[index] ?? null : null;

  // Reset queue when viewer opens with new media
  useEffect(() => {
    if (!open) return;
    const start = clamp(initialIndex, 0, Math.max(0, media.length - 1));
    // Continuous: seed from the opened item forward (skip prior gallery images)
    // so Reels mode starts at 1/N on the video, and sibling videos remain in-queue for P1.
    const seedQueue = continuous ? media.slice(start) : media;
    const seedIndex = continuous ? 0 : start;

    setQueue(seedQueue);
    setIndex(seedIndex);
    setZoomState(1);
    seedRef.current = seedQueue[0] ?? media[start] ?? media[0] ?? null;
    setNextCursor(null);
    setHasMore(continuous);

    if (continuous && seedRef.current) {
      const service = getMediaRecommendationService();
      // Different product → brand-new recommendation queue (do not continue old journey)
      service.beginContinuousSession(recommendationSeedKey(seedRef.current));
      service.remember(seedQueue.map((m) => m.id));
      fetchingRef.current = true;
      const page = service.recommend({
        current: seedRef.current,
        excludeIds: seedQueue.map((m) => m.id),
        limit: 6,
      });
      fetchingRef.current = false;
      if (page.items.length) {
        setQueue((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const add = page.items.filter((m) => !seen.has(m.id));
          return add.length ? [...prev, ...add] : prev;
        });
      }
      setNextCursor(page.nextCursor);
      setHasMore(Boolean(page.nextCursor));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on open / seed change
  }, [open, continuous, media, initialIndex]);

  const fetchMore = useCallback(() => {
    if (!continuous || fetchingRef.current || !hasMore || !seedRef.current) {
      return;
    }
    fetchingRef.current = true;
    const service = getMediaRecommendationService();
    let cursor = nextCursor;
    let excludeIds = queue.map((m) => m.id);
    let added: ViewerMediaItem[] = [];

    // Skip empty strategy buckets until we fill a page or exhaust
    for (let guard = 0; guard < 8; guard++) {
      const page = service.recommend({
        current: seedRef.current,
        excludeIds,
        cursor,
        limit: 6,
      });
      if (page.items.length) {
        added = page.items;
        cursor = page.nextCursor;
        break;
      }
      cursor = page.nextCursor;
      if (!cursor) break;
    }

    fetchingRef.current = false;
    if (added.length) {
      setQueue((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const add = added.filter((m) => !seen.has(m.id));
        return add.length ? [...prev, ...add] : prev;
      });
    }
    setNextCursor(cursor);
    setHasMore(Boolean(cursor));
  }, [continuous, hasMore, nextCursor, queue]);

  // Prefetch when near the end of the queue
  useEffect(() => {
    if (!open || !continuous) return;
    if (index >= count - 3) fetchMore();
  }, [open, continuous, index, count, fetchMore]);

  // URL sync (gallery mode only — continuous indices are not product-local)
  useEffect(() => {
    if (!open || continuous) return;
    syncMediaParam(index, syncUrl);
  }, [open, index, syncUrl, continuous]);

  // Adjacent preload
  useEffect(() => {
    if (!open || count === 0) return;
    preloadAdjacent(queue[index - 1]);
    preloadAdjacent(queue[index + 1]);
  }, [open, index, queue, count]);

  const goTo = useCallback(
    (i: number) => {
      const next = clamp(i, 0, Math.max(0, count - 1));
      setIndex((prev) => {
        if (next > prev) {
          trackMediaEvent("media_swipe_next", {
            index: next,
            mediaId: queue[next]?.id,
            type: queue[next]?.type,
            source,
          });
        } else if (next < prev) {
          trackMediaEvent("media_swipe_previous", {
            index: next,
            mediaId: queue[next]?.id,
            type: queue[next]?.type,
            source,
          });
        }
        return next;
      });
      setZoomState(1);
      onIndexChange?.(next);
    },
    [count, queue, onIndexChange, source]
  );

  const goNext = useCallback(() => {
    if (continuous && Date.now() - wheelLock.current < 280) return;
    wheelLock.current = Date.now();

    setIndex((prev) => {
      if (prev >= count - 1) {
        if (continuous) fetchMore();
        return prev;
      }
      const next = prev + 1;
      trackMediaEvent("media_swipe_next", {
        index: next,
        mediaId: queue[next]?.id,
        type: queue[next]?.type,
        source,
      });
      onIndexChange?.(next);
      return next;
    });
    setZoomState(1);
  }, [count, queue, onIndexChange, source, continuous, fetchMore]);

  const goPrev = useCallback(() => {
    if (continuous && Date.now() - wheelLock.current < 280) return;
    wheelLock.current = Date.now();

    setIndex((prev) => {
      if (prev <= 0) return prev;
      const next = prev - 1;
      trackMediaEvent("media_swipe_previous", {
        index: next,
        mediaId: queue[next]?.id,
        type: queue[next]?.type,
        source,
      });
      onIndexChange?.(next);
      return next;
    });
    setZoomState(1);
  }, [queue, onIndexChange, source, continuous]);

  const setZoom = useCallback(
    (z: number) => {
      const next = clamp(z, 1, 4);
      setZoomState((prev) => {
        if (next !== prev) {
          trackMediaEvent("media_zoom", { zoomLevel: next, source });
        }
        return next;
      });
    },
    [source]
  );

  const resetZoom = useCallback(() => setZoomState(1), []);

  const toggleZoomAt = useCallback(() => {
    setZoomState((prev) => {
      const next = prev > 1 ? 1 : 2.5;
      trackMediaEvent("media_zoom", { zoomLevel: next, source });
      return next;
    });
  }, [source]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight" || (continuous && e.key === "ArrowDown")) {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || (continuous && e.key === "ArrowUp")) {
        e.preventDefault();
        goPrev();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoomState((z) => {
          const next = clamp(z + 0.5, 1, 4);
          trackMediaEvent("media_zoom", { zoomLevel: next, source });
          return next;
        });
      } else if (e.key === "-") {
        e.preventDefault();
        setZoomState((z) => {
          const next = clamp(z - 0.5, 1, 4);
          trackMediaEvent("media_zoom", { zoomLevel: next, source });
          return next;
        });
      }
    };

    window.addEventListener("keydown", onKey);

    const root = rootElement;
    const focusable = root?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !focusable || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onTab);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keydown", onTab);
    };
  }, [open, onClose, goNext, goPrev, rootElement, source, continuous]);

  return {
    index,
    current,
    queue,
    count,
    zoom,
    isZoomed: zoom > 1,
    continuous,
    hasMore,
    goNext,
    goPrev,
    goTo,
    setZoom,
    resetZoom,
    toggleZoomAt,
  };
}
