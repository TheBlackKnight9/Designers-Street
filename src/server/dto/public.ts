import type { FeedPostData } from "@/lib/types";

/** Single media item for public consumers (backend-controlled). */
export type MediaItemDTO = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl: string | null;
  displayOrder: number;
  /** Cloudinary public id when available — enables client transforms */
  publicId?: string | null;
};

export type DesignerPreviewDTO = {
  id: string;
  name: string;
  handle: string;
  logo: string;
  verified: boolean;
};

/** Store / home / category card */
export type ProductCardDTO = {
  id: string;
  name: string;
  designerName: string;
  designerId: string;
  price: number;
  mrp: number | null;
  bestPrice: number | null;
  category: string;
  subcategory: string | null;
  gender: "men" | "women" | "unisex";
  coverImage: string;
  gallery: MediaItemDTO[];
  videoPreview: string | null;
  sizes: string[];
  colors: string[];
  tags: string[];
  customizable: boolean;
  limitedEdition: boolean;
  piecesRemaining: number | null;
  editionTotal: number | null;
  editionSold: number;
  recentPurchaseCount: number;
  editorsPick: boolean;
  handcrafted: boolean;
  madeToOrder: boolean;
  sustainable: boolean;
  badges: string[];
  rating: number | null;
  verified: boolean;
};

/** PDP payload */
export type ProductDetailDTO = ProductCardDTO & {
  description: string;
  story: string | null;
  craftOrigin: string | null;
  material: string | null;
  technique: string | null;
  fit: string | null;
  occasion: string | null;
  deliveryText: string | null;
  careInstructions: string | null;
  designerInspiration: string | null;
  designer: DesignerPreviewDTO;
};

/** Mirrors FeedPostData for existing FeedPost UI */
export type FeedPostDTO = FeedPostData;

export type CategoryDTO = {
  slug: string;
  label: string;
  image: string;
  caption?: string;
  children?: CategoryDTO[];
};

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};

export type PublicProductSort = "newest" | "featured" | "trending";

export type PublicProductFilters = {
  category?: string | null;
  designer?: string | null;
  tag?: string | null;
  color?: string | null;
  size?: string | null;
  customizable?: boolean | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: PublicProductSort | null;
};
