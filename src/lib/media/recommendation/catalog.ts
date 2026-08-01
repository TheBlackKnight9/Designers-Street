import { PRODUCTS, FEED_POSTS } from "@/lib/mock-data";
import { productToViewerMedia, feedPostToViewerMedia } from "@/lib/media/adapters";
import { resolveShoppableReel } from "@/lib/media/shoppable";
import type { MediaPoolEntry } from "./types";

/**
 * Continuous discovery pool — prefer shoppable product videos
 * so swipe sessions stay in a buyable luxury-commerce loop.
 */
export function buildMediaPool(): MediaPoolEntry[] {
  const pool: MediaPoolEntry[] = [];
  const seen = new Set<string>();

  for (const product of PRODUCTS) {
    const items = productToViewerMedia(product);
    for (const item of items) {
      if (item.type !== "video") continue;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      const shoppable = resolveShoppableReel({
        ...item,
        designerId: product.designerId,
        category: product.category,
        tags: product.tags,
        price: product.price,
        colors: product.colors,
        productId: product.id,
      });
      pool.push(shoppable);
    }
  }

  for (const post of FEED_POSTS) {
    const items = feedPostToViewerMedia(post);
    for (const item of items) {
      if (item.type !== "video") continue;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      const shoppable = resolveShoppableReel({
        ...item,
        designerId: post.designerId ?? item.designerId,
        productId: post.productTag?.productId ?? item.productId,
        tags: post.tag ? [post.tag.toLowerCase()] : item.tags,
      });
      pool.push(shoppable);
    }
  }

  return pool;
}

let cachedPool: MediaPoolEntry[] | null = null;

export function getMediaPool(): MediaPoolEntry[] {
  if (!cachedPool) cachedPool = buildMediaPool();
  return cachedPool;
}

/** Call after seed data changes in dev / hot reload */
export function resetMediaPoolCache(): void {
  cachedPool = null;
}
