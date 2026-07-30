import type { ViewerMediaItem } from "@/lib/media/types";

/** Seed context for building a continuous discovery queue */
export type MediaRecommendationSeed = {
  current: ViewerMediaItem;
  /** Exclude these ids from recommendations (session + seed queue) */
  excludeIds?: string[];
  cursor?: string | null;
  limit?: number;
};

export type MediaRecommendationPage = {
  items: ViewerMediaItem[];
  nextCursor: string | null;
};

export type RecommendationStrategyId =
  | "same_product"
  | "same_designer"
  | "similar_products"
  | "image_fallback";

export type MediaPoolEntry = ViewerMediaItem & {
  designerId?: string;
  category?: string;
  tags?: string[];
  price?: number;
  colors?: string[];
};
