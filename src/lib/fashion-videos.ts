/**
 * Fashion lookbook videos — Pexels editorial / runway clips.
 * Licensed for demo use via Pexels. Replace with atelier uploads in production.
 */
export const FASHION_VIDEOS = {
  runwayNoir: "https://videos.pexels.com/video-files/6769794/6769794-hd_1080_1920_25fps.mp4",
  bridalGold: "https://videos.pexels.com/video-files/4058851/4058851-hd_1080_1920_30fps.mp4",
  atelierSilk: "https://videos.pexels.com/video-files/3771812/3771812-hd_1080_1920_30fps.mp4",
  streetPulse: "https://videos.pexels.com/video-files/5481720/5481720-hd_1080_1920_25fps.mp4",
  coutureWaltz: "https://videos.pexels.com/video-files/4058115/4058115-hd_1080_1920_30fps.mp4",
  heritage: "https://videos.pexels.com/video-files/4761704/4761704-hd_1080_1920_25fps.mp4",
  tokyoNeon: "https://videos.pexels.com/video-files/6898873/6898873-uhd_1440_2732_24fps.mp4",
  minimal: "https://videos.pexels.com/video-files/3191909/3191909-hd_1080_1920_30fps.mp4",
  velvetNight: "https://videos.pexels.com/video-files/6769661/6769661-hd_1080_1920_25fps.mp4",
  gardenBloom: "https://videos.pexels.com/video-files/3188463/3188463-hd_1080_1920_30fps.mp4",
  groomEdit: "https://videos.pexels.com/video-files/3254067/3254067-hd_1080_1920_30fps.mp4",
  festiveSaree: "https://videos.pexels.com/video-files/8679905/8679905-uhd_1440_2732_25fps.mp4",
  lookbookScored: "https://videos.pexels.com/video-files/6898873/6898873-uhd_1440_2732_24fps.mp4",
  runwayScored: "https://videos.pexels.com/video-files/6769794/6769794-hd_1080_1920_25fps.mp4",
  atelierScored: "https://videos.pexels.com/video-files/3771812/3771812-hd_1080_1920_30fps.mp4",
  coutureScored: "https://videos.pexels.com/video-files/4058115/4058115-hd_1080_1920_30fps.mp4",
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
