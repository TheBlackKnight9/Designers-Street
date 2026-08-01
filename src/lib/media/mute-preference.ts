/**
 * Persist mute preference across continuous video sessions (Reels-style).
 * Autoplay still starts muted on first visit (browser policy); unmute sticks.
 */

const STORAGE_KEY = "ds-media-muted";

export function getPreferredMuted(defaultMuted = true): boolean {
  if (typeof window === "undefined") return defaultMuted;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return defaultMuted;
    return raw === "1";
  } catch {
    return defaultMuted;
  }
}

export function setPreferredMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // ignore
  }
}
