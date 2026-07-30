/**
 * Fashion lookbook video catalog — local demo clips with distinct music beds.
 * Replace with Cloudinary URLs when atelier uploads are available.
 */
export const FASHION_VIDEOS = {
  runwayNoir: "/videos/fashion-runway-noir.mp4",
  bridalGold: "/videos/fashion-bridal-gold.mp4",
  atelierSilk: "/videos/fashion-atelier-silk.mp4",
  streetPulse: "/videos/fashion-street-pulse.mp4",
  coutureWaltz: "/videos/fashion-couture-waltz.mp4",
  heritage: "/videos/fashion-heritage.mp4",
  tokyoNeon: "/videos/fashion-tokyo-neon.mp4",
  minimal: "/videos/fashion-minimal-white.mp4",
  velvetNight: "/videos/fashion-velvet-night.mp4",
  gardenBloom: "/videos/fashion-garden-bloom.mp4",
  groomEdit: "/videos/fashion-groom-edit.mp4",
  festiveSaree: "/videos/fashion-festive-saree.mp4",
  lookbookScored: "/videos/lookbook-vertical-scored.mp4",
  runwayScored: "/videos/runway-spotlight-scored.mp4",
  atelierScored: "/videos/atelier-fabric-scored.mp4",
  coutureScored: "/videos/couture-motion-scored.mp4",
} as const;

export type FashionVideoKey = keyof typeof FASHION_VIDEOS;

/** All scored / titled lookbook paths (for recommendation pool density) */
export const ALL_FASHION_VIDEO_URLS = Object.values(FASHION_VIDEOS);
