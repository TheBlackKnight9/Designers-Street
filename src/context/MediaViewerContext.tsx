"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  OpenMediaViewerOptions,
  ViewerMediaItem,
} from "@/lib/media/types";
import { trackMediaEvent } from "@/lib/media/media-analytics";
import { MediaViewer } from "@/components/media/MediaViewer";
import { syncMediaParam } from "@/hooks/useMediaViewer";

type MediaViewerContextValue = {
  openMediaViewer: (options: OpenMediaViewerOptions) => void;
  closeMediaViewer: () => void;
  isOpen: boolean;
};

const MediaViewerContext = createContext<MediaViewerContextValue | null>(null);

export function MediaViewerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<ViewerMediaItem[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [syncUrl, setSyncUrl] = useState(false);
  const [source, setSource] = useState<string | undefined>();
  const [continuous, setContinuous] = useState(false);

  const closeMediaViewer = useCallback(() => {
    trackMediaEvent("media_closed", { source });
    if (syncUrl && !continuous) syncMediaParam(0, true, true);
    setOpen(false);
  }, [source, syncUrl, continuous]);

  const openMediaViewer = useCallback((options: OpenMediaViewerOptions) => {
    if (!options.media?.length) return;
    const idx = options.initialIndex ?? 0;
    const start = options.media[idx] ?? options.media[0];
    const useContinuous =
      options.continuous ?? start?.type === "video";

    setMedia(options.media);
    setInitialIndex(idx);
    setSyncUrl(Boolean(options.syncUrl) && !useContinuous);
    setSource(options.source);
    setContinuous(useContinuous);
    setOpen(true);
    trackMediaEvent("media_opened", {
      index: idx,
      mediaId: options.media[idx]?.id,
      type: options.media[idx]?.type,
      productId: options.media[idx]?.productId,
      postId: options.media[idx]?.postId,
      source: options.source,
    });
  }, []);

  const value = useMemo(
    () => ({ openMediaViewer, closeMediaViewer, isOpen: open }),
    [openMediaViewer, closeMediaViewer, open]
  );

  return (
    <MediaViewerContext.Provider value={value}>
      {children}
      <MediaViewer
        key={`${source ?? "viewer"}-${initialIndex}-${media[0]?.id ?? "empty"}-${continuous ? "c" : "g"}-${open ? "open" : "closed"}`}
        open={open}
        media={media}
        initialIndex={initialIndex}
        syncUrl={syncUrl}
        source={source}
        continuous={continuous}
        onClose={closeMediaViewer}
      />
    </MediaViewerContext.Provider>
  );
}

export function useOpenMediaViewer(): MediaViewerContextValue {
  const ctx = useContext(MediaViewerContext);
  if (!ctx) {
    throw new Error("useOpenMediaViewer must be used within MediaViewerProvider");
  }
  return ctx;
}

/** Safe opener for future Saved Items / collections — null outside provider. */
export function useOptionalMediaViewer(): MediaViewerContextValue | null {
  return useContext(MediaViewerContext);
}
