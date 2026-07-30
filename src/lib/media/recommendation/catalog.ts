import { PRODUCTS, FEED_POSTS } from "@/lib/mock-data";
import { productToViewerMedia, feedPostToViewerMedia } from "@/lib/media/adapters";
import type { MediaPoolEntry } from "./types";

/**
 * Build a flat catalog of discoverable media from mock/seed sources.
 * Later: replace with API-backed cursor pages without changing the viewer.
 */
export function buildMediaPool(): MediaPoolEntry[] {
  const pool: MediaPoolEntry[] = [];
  const seen = new Set<string>();

  for (const product of PRODUCTS) {
    const items = productToViewerMedia(product);
    for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      pool.push({
        ...item,
        designerId: product.designerId,
        category: product.category,
        tags: product.tags,
        price: product.price,
        colors: product.colors,
        productId: product.id,
      });
    }
  }

  for (const post of FEED_POSTS) {
    const items = feedPostToViewerMedia(post);
    for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      pool.push({
        ...item,
        designerId: post.designerId,
        productId: post.productTag?.productId ?? item.productId,
        tags: post.tag ? [post.tag.toLowerCase()] : undefined,
      });
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
