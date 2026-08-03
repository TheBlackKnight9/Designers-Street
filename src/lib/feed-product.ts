import type { FeedPostData } from "@/lib/types";

type RawProductTag = FeedPostData["productTag"] & {
  id?: string;
};

/** Normalize dashboard/API product tags — legacy posts used `id` instead of `productId`. */
export function normalizeFeedProductTag(
  tag: RawProductTag | null | undefined
): FeedPostData["productTag"] | undefined {
  if (!tag || typeof tag !== "object") return undefined;
  const productId =
    tag.productId ??
    (typeof tag.id === "string" ? tag.id : undefined);
  if (!tag.name && !productId) return undefined;
  return {
    name: tag.name ?? "Product",
    price: typeof tag.price === "number" ? tag.price : 0,
    productId,
  };
}

export function resolvePostProductId(post: FeedPostData): string | undefined {
  const normalized = normalizeFeedProductTag(post.productTag);
  if (normalized?.productId) return normalized.productId;
  const match = post.link?.match(/\/product\/([^/?#]+)/);
  return match?.[1];
}

/** Client-side tag cleanup after feed API responses. */
export function normalizeFeedPosts(items: FeedPostData[]): FeedPostData[] {
  return items.map((post) => ({
    ...post,
    productTag:
      normalizeFeedProductTag(
        post.productTag as FeedPostData["productTag"] & { id?: string }
      ) ?? post.productTag,
  }));
}
