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
