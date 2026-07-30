"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import type { ViewerMediaItem } from "@/lib/media/types";
import { getOptimizedMediaUrl } from "@/lib/media/cloudinary-delivery";
import { MediaPlaybackCoordinator } from "@/lib/media/playback-coordinator";
import { trackMediaEvent } from "@/lib/media/media-analytics";
import {
  clearWatchProgress,
  formatWatchTime,
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
};

const SAVE_INTERVAL_MS = 2000;

export function VideoViewer({
  item,
  isActive,
  autoPlay = true,
}: VideoViewerProps) {
  const reactId = useId();
  const instanceId = `${item.id}-${reactId}`;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSaveRef = useRef(0);
  const resumedRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Restore mute preference once on mount (autoplay-safe default = muted)
  useEffect(() => {
    setMuted(getPreferredMuted(true));
  }, []);

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

  const persistProgress = (force = false) => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    const now = Date.now();
    if (!force && now - lastSaveRef.current < SAVE_INTERVAL_MS) return;
    lastSaveRef.current = now;
    saveWatchProgress(item.id, el.currentTime, el.duration);
  };

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

  // Reset resume flag when media changes
  useEffect(() => {
    resumedRef.current = false;
    lastSaveRef.current = 0;
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
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

  // Flush on page hide / unmount
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
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="max-w-full max-h-full object-contain"
        src={src}
        poster={poster}
        playsInline
        muted={muted}
        controls={false}
        onLoadedMetadata={() => {
          const el = videoRef.current;
          if (!el) return;
          setDuration(el.duration || 0);
          if (resumedRef.current) return;
          const resume = getResumePosition(item.id);
          if (resume != null && resume < el.duration) {
            el.currentTime = resume;
            setCurrentTime(resume);
            setProgress(el.duration ? resume / el.duration : 0);
          }
          resumedRef.current = true;
        }}
        onTimeUpdate={() => {
          const el = videoRef.current;
          if (!el || !el.duration) return;
          setProgress(el.currentTime / el.duration);
          setCurrentTime(el.currentTime);
          setDuration(el.duration);
          const now = Date.now();
          if (now - lastSaveRef.current >= SAVE_INTERVAL_MS) {
            lastSaveRef.current = now;
            saveWatchProgress(item.id, el.currentTime, el.duration);
          }
        }}
        onEnded={() => {
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

      {/* Floating mute — Instagram-style, always reachable */}
      <button
        type="button"
        onClick={toggleMute}
        className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm active:scale-95 transition-transform"
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

      <div className="absolute bottom-20 left-0 right-0 px-4 flex flex-col gap-2 safe-area-pb">
        <div className="flex justify-between font-sans text-[10px] tabular-nums text-white/70 px-0.5">
          <span>{formatWatchTime(currentTime)}</span>
          <span>{formatWatchTime(duration)}</span>
        </div>
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
            if (!el || !duration) return;
            const v = Number(e.target.value);
            el.currentTime = v * duration;
            setProgress(v);
            setCurrentTime(v * duration);
            saveWatchProgress(item.id, v * duration, duration);
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

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
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
