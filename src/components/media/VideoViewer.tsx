"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import type { ViewerMediaItem } from "@/lib/media/types";
import { getOptimizedMediaUrl } from "@/lib/media/cloudinary-delivery";
import { MediaPlaybackCoordinator } from "@/lib/media/playback-coordinator";
import { trackMediaEvent } from "@/lib/media/media-analytics";
import {
  clearWatchProgress,
  getResumePosition,
  saveWatchProgress,
} from "@/lib/media/watch-progress";
import {
  getPreferredMuted,
  setPreferredMuted,
} from "@/lib/media/mute-preference";

type VideoViewerProps = {
  item: ViewerMediaItem;
  isActive: boolean;
  autoPlay?: boolean;
  /** Immersive reels chrome — edge-to-edge, minimal controls */
  reelMode?: boolean;
  onSingleTap?: () => void;
  preloadUrl?: string | null;
  /** Prefetch next 2–3 reel URLs (continuous mode) */
  preloadUrls?: (string | null | undefined)[];
};

const SAVE_INTERVAL_MS = 2000;

export function VideoViewer({
  item,
  isActive,
  autoPlay = true,
  reelMode = false,
  onSingleTap,
  preloadUrl,
  preloadUrls,
}: VideoViewerProps) {
  const reactId = useId();
  const instanceId = `${item.id}-${reactId}`;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSaveRef = useRef(0);
  const resumedRef = useRef(false);
  const milestonesRef = useRef<Set<number>>(new Set());
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [fadedIn, setFadedIn] = useState(false);

  useEffect(() => {
    setMuted(getPreferredMuted(true));
  }, []);

  // Preload next 2–3 reels quietly
  useEffect(() => {
    if (typeof document === "undefined") return;
    const urls = [...(preloadUrls || []), preloadUrl].filter(
      (u): u is string => Boolean(u)
    );
    const unique = [...new Set(urls)].slice(0, 3);
    if (!unique.length) return;
    const els: HTMLVideoElement[] = [];
    for (const url of unique) {
      const el = document.createElement("video");
      el.preload = "auto";
      el.muted = true;
      el.playsInline = true;
      el.src = url;
      el.load();
      els.push(el);
    }
    return () => {
      for (const el of els) {
        el.removeAttribute("src");
        el.load();
      }
    };
  }, [preloadUrl, preloadUrls]);

  const src = failed
    ? item.url
    : getOptimizedMediaUrl(
        { url: item.url, publicId: item.publicId, type: "video" },
        "stream"
      );

  const poster =
    item.thumbnailUrl ||
    getOptimizedMediaUrl(
      { url: item.url, publicId: item.publicId, type: "video" },
      "thumb"
    );

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    return MediaPlaybackCoordinator.register(instanceId, () => {
      const v = videoRef.current;
      if (v?.duration) {
        saveWatchProgress(item.id, v.currentTime, v.duration);
      }
      el.pause();
      setPlaying(false);
    });
  }, [instanceId, item.id]);

  useEffect(() => {
    resumedRef.current = false;
    lastSaveRef.current = 0;
    milestonesRef.current = new Set();
    setProgress(0);
    setReady(false);
    setBuffering(true);
    setFailed(false);
    setFadedIn(false);
  }, [item.id]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!isActive) {
      if (el.duration) {
        saveWatchProgress(item.id, el.currentTime, el.duration);
      }
      el.pause();
      queueMicrotask(() => setPlaying(false));
      MediaPlaybackCoordinator.release(instanceId);
      return;
    }

    if (!autoPlay) return;

    MediaPlaybackCoordinator.claim(instanceId);
    let cancelled = false;
    el.play()
      .then(() => {
        if (cancelled) return;
        setPlaying(true);
        setBuffering(false);
        trackMediaEvent("video_play", {
          mediaId: item.id,
          type: "video",
          productId: item.productId,
        });
      })
      .catch(() => {
        if (!cancelled) setPlaying(false);
      });

    return () => {
      cancelled = true;
      if (el.duration) {
        saveWatchProgress(item.id, el.currentTime, el.duration);
      }
    };
  }, [isActive, autoPlay, instanceId, item.id, item.productId]);

  useEffect(() => {
    const flush = () => {
      const el = videoRef.current;
      if (el?.duration) {
        saveWatchProgress(item.id, el.currentTime, el.duration);
      }
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVis);
      flush();
    };
  }, [item.id]);

  if (!isActive) return null;

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      MediaPlaybackCoordinator.claim(instanceId);
      el.play()
        .then(() => {
          setPlaying(true);
          trackMediaEvent("video_play", { mediaId: item.id, type: "video" });
        })
        .catch(() => undefined);
    } else {
      if (el.duration) {
        saveWatchProgress(item.id, el.currentTime, el.duration);
      }
      el.pause();
      setPlaying(false);
      trackMediaEvent("video_pause", { mediaId: item.id, type: "video" });
    }
    onSingleTap?.();
  };

  const toggleMute = (e?: MouseEvent) => {
    e?.stopPropagation();
    setMuted((prev) => {
      const next = !prev;
      setPreferredMuted(next);
      return next;
    });
  };

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-black ${
        reelMode ? "overflow-hidden" : "flex-col"
      }`}
    >
      {/* Soft poster while buffering — avoids black flash */}
      {poster && (!ready || buffering || !fadedIn) && (
        <div
          className={`absolute inset-0 bg-cover bg-center scale-105 blur-md transition-opacity duration-500 ease-out ${
            ready && !buffering && fadedIn ? "opacity-0" : "opacity-70"
          }`}
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden
        />
      )}

      <video
        ref={videoRef}
        className={
          reelMode
            ? `absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
                fadedIn && ready ? "opacity-100" : "opacity-0"
              }`
            : "max-w-full max-h-full object-contain"
        }
        src={src}
        poster={poster || undefined}
        playsInline
        loop={reelMode}
        muted={muted}
        preload="auto"
        controls={false}
        onLoadedMetadata={() => {
          const el = videoRef.current;
          if (!el) return;
          setReady(true);
          if (resumedRef.current || reelMode) return;
          const resume = getResumePosition(item.id);
          if (resume != null && resume < el.duration) {
            el.currentTime = resume;
            setProgress(el.duration ? resume / el.duration : 0);
          }
          resumedRef.current = true;
        }}
        onCanPlay={() => {
          setBuffering(false);
          setReady(true);
          requestAnimationFrame(() => setFadedIn(true));
        }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => {
          setBuffering(false);
          setFadedIn(true);
        }}
        onTimeUpdate={() => {
          const el = videoRef.current;
          if (!el || !el.duration) return;
          const pct = el.currentTime / el.duration;
          setProgress(pct);
          const now = Date.now();
          if (now - lastSaveRef.current >= SAVE_INTERVAL_MS) {
            lastSaveRef.current = now;
            saveWatchProgress(item.id, el.currentTime, el.duration);
          }
          if (reelMode) {
            for (const mark of [0.25, 0.5, 1] as const) {
              if (pct >= mark && !milestonesRef.current.has(mark)) {
                milestonesRef.current.add(mark);
                const event =
                  mark === 0.25
                    ? "reel_watch_25"
                    : mark === 0.5
                      ? "reel_watch_50"
                      : "reel_watch_100";
                trackMediaEvent(event, {
                  mediaId: item.id,
                  type: "video",
                  productId: item.productId,
                  watchPct: mark * 100,
                });
                if (mark === 1) {
                  trackMediaEvent("video_completed", {
                    mediaId: item.id,
                    type: "video",
                    productId: item.productId,
                  });
                }
              }
            }
          }
        }}
        onEnded={() => {
          if (reelMode) return;
          setPlaying(false);
          clearWatchProgress(item.id);
          trackMediaEvent("video_completed", {
            mediaId: item.id,
            type: "video",
          });
          MediaPlaybackCoordinator.release(instanceId);
        }}
        onError={() => setFailed(true)}
        onClick={togglePlay}
      />

      {/* Thin progress — reels style */}
      <div
        className={`absolute left-0 right-0 z-20 h-[2px] bg-white/20 ${
          reelMode ? "top-0" : "bottom-0"
        }`}
      >
        <div
          className="h-full bg-white/90 transition-[width] duration-150 ease-linear"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>

      {/* Mute — top left in reel mode (right rail is for social) */}
      <button
        type="button"
        onClick={toggleMute}
        className={`absolute z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:scale-95 ${
          reelMode
            ? "top-[max(3.5rem,calc(env(safe-area-inset-top)+2.75rem))] left-3"
            : "top-4 right-4 h-11 w-11"
        }`}
        aria-label={muted ? "Unmute video" : "Mute video"}
        aria-pressed={!muted}
      >
        {muted ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h3.86l4.64-3.48v14.46l-4.64-3.48H5.25a.75.75 0 01-.75-.75v-6a.75.75 0 01.75-.75z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-4 6M15 9l4 6" />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h3.86l4.64-3.48v14.46l-4.64-3.48H5.25a.75.75 0 01-.75-.75v-6a.75.75 0 01.75-.75z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25a5.25 5.25 0 010 7.5M18.75 6a8.25 8.25 0 010 12" />
          </svg>
        )}
      </button>

      {!playing && ready && !buffering && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
            <svg className="h-7 w-7 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v13.72L19 12 8 5.14z" />
            </svg>
          </span>
        </div>
      )}

      {buffering && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-label="Loading" />
        </div>
      )}

      {!reelMode && (
        <div className="absolute bottom-20 left-0 right-0 px-4 flex flex-col gap-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            aria-label="Seek"
            className="w-full accent-white"
            onChange={(e) => {
              const el = videoRef.current;
              if (!el || !el.duration) return;
              const v = Number(e.target.value);
              el.currentTime = v * el.duration;
              setProgress(v);
              saveWatchProgress(item.id, v * el.duration, el.duration);
            }}
          />
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="px-4 py-2 bg-white/15 text-white text-xs font-bold uppercase tracking-wider rounded-full"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="px-4 py-2 bg-white/15 text-white text-xs font-bold uppercase tracking-wider rounded-full"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/60">
          <p className="text-white/80 text-xs">Video failed to load</p>
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
