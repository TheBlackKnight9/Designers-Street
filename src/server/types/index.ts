export type {
  DesignerHouse,
  Product,
  Category,
  FeedPostData,
  StoryItem,
  StorySlide,
  CartItem,
  BespokeConfig,
} from "@/lib/types";

export type {
  MediaRecord,
  MediaType,
  CreateMediaInput,
} from "@/server/types/media";

/**
 * Platform user roles.
 * "designer" is kept for backward-compat with existing DB rows but
 * is never assigned to new users — treated as "buyer" at the permission layer.
 */
export type UserRole = "buyer" | "designer" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatarUrl: string | null;
};

export type FeedPage = {
  items: import("@/lib/types").FeedPostData[];
  nextCursor: string | null;
};
