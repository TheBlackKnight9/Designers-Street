/**
 * Demo lookbook videos — small progressive MP4s (Cloudinary transforms keep
 * payloads under ~2MB so reels start quickly). Avoid raw 30MB demo masters.
 */
const cld = (path: string) =>
  `https://res.cloudinary.com/demo/video/upload/w_720,c_limit,q_auto:eco,f_mp4,vc_h264/${path}`;

export const FASHION_VIDEOS = {
  runwayNoir: cld("ski_jump.mp4"),
  bridalGold: cld("dog.mp4"),
  atelierSilk: cld("cld-sample-video.mp4"),
  streetPulse: cld("samples/cld-sample-video.mp4"),
  coutureWaltz: cld("ski_jump.mp4"),
  heritage: cld("dog.mp4"),
  tokyoNeon: cld("cld-sample-video.mp4"),
  minimal: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  velvetNight: cld("samples/sea-turtle.mp4"),
  gardenBloom: cld("sea_turtle.mp4"),
  groomEdit: "https://www.w3schools.com/html/mov_bbb.mp4",
  festiveSaree: cld("ski_jump.mp4"),
  lookbookScored: cld("dog.mp4"),
  runwayScored: cld("cld-sample-video.mp4"),
  atelierScored: cld("ski_jump.mp4"),
  coutureScored: cld("dog.mp4"),
} as const;

export type FashionVideoKey = keyof typeof FASHION_VIDEOS;

export const ALL_FASHION_VIDEO_URLS = Object.values(FASHION_VIDEOS);

export function pickFashionVideos(count: number, startIndex = 0): string[] {
  if (count <= 0) return [];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(ALL_FASHION_VIDEO_URLS[(startIndex + i) % ALL_FASHION_VIDEO_URLS.length]);
  }
  return out;
}

export function pickFashionVideo(index: number): string {
  return ALL_FASHION_VIDEO_URLS[index % ALL_FASHION_VIDEO_URLS.length];
}

/** True when a URL is a direct video asset (not a still poster). */
export function isVideoAssetUrl(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  if (/\/video\/upload\//i.test(clean)) return true;
  return /\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(clean);
}

/**
 * Prefer a lightweight progressive MP4 for <video> playback.
 * Fake seed publicIds must never override a real delivery URL.
 */
export function toPlayableVideoUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (!/res\.cloudinary\.com/i.test(parsed.hostname)) return url;
    // Already transformed
    if (/\/upload\/(?:[^/]+,)+[^/]+\//.test(parsed.pathname)) return url;
    // Inject compact progressive delivery after /video/upload/ or /upload/
    return url.replace(
      /\/(video\/)?upload\//i,
      (_m, videoPrefix: string | undefined) =>
        `/${videoPrefix || ""}upload/w_720,c_limit,q_auto:eco,f_mp4,vc_h264/`
    );
  } catch {
    return url;
  }
}
