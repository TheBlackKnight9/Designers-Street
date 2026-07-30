import type { Product, DesignerHouse, Category, FeedPostData, StoryItem } from "@/lib/types";
import {
  PRODUCTS,
  DESIGNERS,
  CATEGORIES,
  FEED_POSTS,
  STORIES,
  getProductById,
  getDesignerById,
  getDesignerByHandle,
  getProductsByDesigner,
  getProductsByCategory,
} from "@/lib/mock-data";

/**
 * When true, browser/server callers hit Next.js Route Handlers.
 * Default false → identical to current mock-data behavior (no UI change).
 */
export function isRemoteApiEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_API === "true" ||
    process.env.NEXT_PUBLIC_USE_API === "1"
  );
}

async function getJson<T>(path: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}${path}`, {
    cache: "no-store",
  });
  const body = await res.json();
  if (!res.ok || body?.ok === false) {
    throw new Error(body?.error?.message || `Request failed: ${path}`);
  }
  return body.data as T;
}

export async function listProducts(): Promise<Product[]> {
  if (!isRemoteApiEnabled()) return PRODUCTS;
  return getJson<Product[]>("/api/products");
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!isRemoteApiEnabled()) return getProductById(id) ?? null;
  try {
    return await getJson<Product>(`/api/products/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

export async function listProductsByDesigner(designerId: string): Promise<Product[]> {
  if (!isRemoteApiEnabled()) return getProductsByDesigner(designerId);
  return getJson<Product[]>(
    `/api/products?designerId=${encodeURIComponent(designerId)}`
  );
}

export async function listProductsByCategory(category: string): Promise<Product[]> {
  if (!isRemoteApiEnabled()) return getProductsByCategory(category);
  return getJson<Product[]>(
    `/api/products?category=${encodeURIComponent(category)}`
  );
}

export async function listDesigners(): Promise<DesignerHouse[]> {
  if (!isRemoteApiEnabled()) return DESIGNERS;
  return getJson<DesignerHouse[]>("/api/designers");
}

export async function getDesigner(id: string): Promise<DesignerHouse | null> {
  if (!isRemoteApiEnabled()) return getDesignerById(id) ?? null;
  try {
    return await getJson<DesignerHouse>(
      `/api/designers/${encodeURIComponent(id)}`
    );
  } catch {
    return null;
  }
}

export async function getDesignerByHandleApi(
  handle: string
): Promise<DesignerHouse | null> {
  if (!isRemoteApiEnabled()) {
    return (
      getDesignerByHandle(handle) ??
      DESIGNERS.find((d) => d.handle.toLowerCase() === handle.toLowerCase()) ??
      null
    );
  }
  try {
    return await getJson<DesignerHouse>(
      `/api/designers/handle/${encodeURIComponent(handle)}`
    );
  } catch {
    return null;
  }
}

export async function listFeed(options?: {
  limit?: number;
  cursor?: string | null;
}): Promise<{ items: FeedPostData[]; nextCursor: string | null }> {
  if (!isRemoteApiEnabled()) {
    const limit = options?.limit ?? 10;
    const cursor = options?.cursor;
    const start = cursor
      ? FEED_POSTS.findIndex((p) => p.id === cursor) + 1
      : 0;
    const safeStart = start < 0 ? 0 : start;
    const items = FEED_POSTS.slice(safeStart, safeStart + limit);
    const nextCursor =
      safeStart + limit < FEED_POSTS.length
        ? items[items.length - 1]?.id ?? null
        : null;
    return { items, nextCursor };
  }
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.cursor) params.set("cursor", options.cursor);
  const q = params.toString();
  return getJson(`/api/feed${q ? `?${q}` : ""}`);
}

export async function listStories(): Promise<StoryItem[]> {
  if (!isRemoteApiEnabled()) return STORIES;
  return getJson<StoryItem[]>("/api/feed/stories");
}

export async function listCategories(): Promise<Category[]> {
  if (!isRemoteApiEnabled()) return CATEGORIES;
  return getJson<Category[]>("/api/categories");
}
