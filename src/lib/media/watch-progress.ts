/**
 * Continue Watching — persist last playback position per media id.
 * Browser-local for now; swap storage later without touching VideoViewer.
 */

const STORAGE_KEY = "ds-media-watch-progress";
const MIN_RESUME_SECONDS = 2;
/** Near end: treat as finished and clear progress */
const END_CLEAR_SECONDS = 3;
const MAX_ENTRIES = 80;

export type WatchProgressEntry = {
  position: number;
  duration: number;
  updatedAt: number;
};

type ProgressMap = Record<string, WatchProgressEntry>;

function readAll(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    const entries = Object.entries(map).sort(
      (a, b) => b[1].updatedAt - a[1].updatedAt
    );
    const trimmed = Object.fromEntries(entries.slice(0, MAX_ENTRIES));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Quota / private mode — ignore
  }
}

export function getWatchProgress(mediaId: string): WatchProgressEntry | null {
  if (!mediaId) return null;
  const entry = readAll()[mediaId];
  if (!entry || !Number.isFinite(entry.position)) return null;
  return entry;
}

/** Seconds to seek to, or null if start from beginning */
export function getResumePosition(mediaId: string): number | null {
  const entry = getWatchProgress(mediaId);
  if (!entry) return null;
  if (entry.position < MIN_RESUME_SECONDS) return null;
  if (
    entry.duration > 0 &&
    entry.position >= entry.duration - END_CLEAR_SECONDS
  ) {
    clearWatchProgress(mediaId);
    return null;
  }
  return entry.position;
}

export function saveWatchProgress(
  mediaId: string,
  position: number,
  duration: number
): void {
  if (!mediaId || !Number.isFinite(position) || position < MIN_RESUME_SECONDS) {
    return;
  }
  if (duration > 0 && position >= duration - END_CLEAR_SECONDS) {
    clearWatchProgress(mediaId);
    return;
  }
  const map = readAll();
  map[mediaId] = {
    position,
    duration: Number.isFinite(duration) ? duration : 0,
    updatedAt: Date.now(),
  };
  writeAll(map);
}

export function clearWatchProgress(mediaId: string): void {
  if (!mediaId) return;
  const map = readAll();
  if (!(mediaId in map)) return;
  delete map[mediaId];
  writeAll(map);
}

export function formatWatchTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

/** Queue / recommendation seed identity for smart reset */
export function recommendationSeedKey(item: {
  productId?: string;
  postId?: string;
  id: string;
}): string {
  return item.productId || item.postId || item.id;
}
