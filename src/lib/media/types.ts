export type ViewerMediaType = "image" | "video";

/** Canonical item for the Universal Media Viewer */
export type ViewerMediaItem = {
  id: string;
  type: ViewerMediaType;
  /** Original / playable URL (fallback if transforms fail) */
  url: string;
  thumbnailUrl?: string | null;
  /** Optional Cloudinary public id for transform delivery */
  publicId?: string | null;
  alt?: string;
  /** Optional context for analytics + recommendations */
  productId?: string;
  postId?: string;
  designerId?: string;
  category?: string;
  tags?: string[];
  price?: number;
  colors?: string[];
  /** Commerce / social chrome (continuous reels) */
  productName?: string;
  productDescription?: string;
  sizes?: string[];
  limitedEdition?: boolean;
  designerName?: string;
  designerHandle?: string;
  designerLogo?: string;
  designerVerified?: boolean;
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
  likedByMe?: boolean;
  followingDesigner?: boolean;
  /** Shoppable trust / floating card */
  productImage?: string | null;
  rating?: number;
  piecesRemaining?: number;
  deliveryText?: string;
  designerFollowers?: string;
  designerBio?: string;
};

export type MediaAnalyticsEvent =
  | "media_opened"
  | "media_closed"
  | "media_swipe_next"
  | "media_swipe_previous"
  | "media_zoom"
  | "video_play"
  | "video_pause"
  | "video_completed"
  | "reel_viewed"
  | "reel_watch_25"
  | "reel_watch_50"
  | "reel_watch_100"
  | "product_opened"
  | "add_to_bag"
  | "buy_now"
  | "share"
  | "follow"
  | "comment"
  | "wishlist"
  | "designer_profile_open"
  | "size_selected"
  | "color_selected";

export type MediaAnalyticsPayload = {
  mediaId?: string;
  type?: ViewerMediaType;
  index?: number;
  productId?: string;
  postId?: string;
  designerId?: string;
  zoomLevel?: number;
  source?: string;
  value?: string | number;
  watchPct?: number;
};

export type OpenMediaViewerOptions = {
  media: ViewerMediaItem[];
  initialIndex?: number;
  /** Sync ?media=N into the current URL */
  syncUrl?: boolean;
  /** Analytics / debugging source label */
  source?: string;
  /**
   * Instagram-style continuous discovery (vertical swipe).
   * Defaults to true when the starting item is a video.
   */
  continuous?: boolean;
};
