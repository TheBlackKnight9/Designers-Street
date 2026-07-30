import type {
  Product,
  DesignerHouse,
  Category,
  FeedPostData,
  StoryItem,
} from "@/lib/types";
import type {
  CursorPage,
  ProductCardDTO,
  ProductDetailDTO,
  PublicProductFilters,
} from "@/server/dto/public";
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
import {
  productCardToUiProduct,
  productDetailToUiProduct,
} from "@/lib/api/product-mappers";

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

function buildProductQuery(
  options?: {
    limit?: number;
    cursor?: string | null;
    filters?: PublicProductFilters;
  }
): string {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.cursor) params.set("cursor", options.cursor);
  const f = options?.filters;
  if (f?.category) params.set("category", f.category);
  if (f?.designer) params.set("designer", f.designer);
  if (f?.tag) params.set("tag", f.tag);
  if (f?.color) params.set("color", f.color);
  if (f?.size) params.set("size", f.size);
  if (f?.customizable === true) params.set("customizable", "true");
  if (f?.customizable === false) params.set("customizable", "false");
  if (f?.minPrice != null) params.set("minPrice", String(f.minPrice));
  if (f?.maxPrice != null) params.set("maxPrice", String(f.maxPrice));
  if (f?.sort) params.set("sort", f.sort);
  const q = params.toString();
  return `/api/products${q ? `?${q}` : ""}`;
}

/** Cursor page of product cards (preferred public API). */
export async function listProductCards(options?: {
  limit?: number;
  cursor?: string | null;
  filters?: PublicProductFilters;
}): Promise<CursorPage<ProductCardDTO>> {
  if (!isRemoteApiEnabled()) {
    const limit = options?.limit ?? 24;
    let items = PRODUCTS;
    const f = options?.filters;
    if (f?.category) {
      const c = f.category.toLowerCase();
      items = items.filter(
        (p) =>
          p.category.toLowerCase() === c ||
          p.subcategory?.toLowerCase() === c ||
          p.tags?.some((t) => t.toLowerCase() === c)
      );
    }
    if (f?.designer) {
      const d = f.designer.toLowerCase();
      items = items.filter((p) => {
        const house = getDesignerById(p.designerId);
        return (
          p.designerId.toLowerCase() === d ||
          house?.handle.toLowerCase() === d
        );
      });
    }
    const start = options?.cursor
      ? items.findIndex((p) => p.id === options.cursor) + 1
      : 0;
    const safe = start < 0 ? 0 : start;
    const slice = items.slice(safe, safe + limit);
    const cards: ProductCardDTO[] = slice.map((p) => {
      const gallery = p.images.map((url, i) => ({
        id: `${p.id}-img-${i}`,
        type: "image" as const,
        url,
        thumbnailUrl: null,
        displayOrder: i,
        publicId: null as string | null,
      }));
      return {
        id: p.id,
        name: p.name,
        designerName: p.designerName,
        designerId: p.designerId,
        price: p.price,
        mrp: p.mrp ?? null,
        bestPrice: p.bestPrice ?? null,
        category: p.category,
        subcategory: p.subcategory ?? null,
        gender: p.gender,
        coverImage: p.images[0] || "",
        gallery,
        videoPreview: null,
        sizes: p.sizes,
        colors: p.colors || [],
        tags: p.tags || [],
        customizable: Boolean(p.customizable),
        limitedEdition: Boolean(p.limitedEdition),
        piecesRemaining: p.piecesRemaining ?? null,
        rating: p.rating ?? null,
        verified: Boolean(p.verified),
      };
    });
    return {
      items: cards,
      nextCursor:
        safe + limit < items.length
          ? cards[cards.length - 1]?.id ?? null
          : null,
    };
  }
  return getJson(buildProductQuery(options));
}

/** Returns UI Product[] (mapped from public card DTOs). */
export async function listProducts(options?: {
  limit?: number;
  cursor?: string | null;
  filters?: PublicProductFilters;
}): Promise<Product[]> {
  const page = await listProductCards({
    limit: options?.limit ?? 100,
    cursor: options?.cursor,
    filters: options?.filters,
  });
  return page.items.map(productCardToUiProduct);
}

export async function getProductDetail(
  id: string
): Promise<ProductDetailDTO | null> {
  if (!isRemoteApiEnabled()) {
    const p = getProductById(id);
    if (!p) return null;
    const page = await listProductCards({ limit: 1 });
    void page;
    const designer = getDesignerById(p.designerId);
    const gallery = p.images.map((url, i) => ({
      id: `${p.id}-img-${i}`,
      type: "image" as const,
      url,
      thumbnailUrl: null,
      displayOrder: i,
      publicId: null as string | null,
    }));
    return {
      id: p.id,
      name: p.name,
      designerName: p.designerName,
      designerId: p.designerId,
      price: p.price,
      mrp: p.mrp ?? null,
      bestPrice: p.bestPrice ?? null,
      category: p.category,
      subcategory: p.subcategory ?? null,
      gender: p.gender,
      coverImage: p.images[0] || "",
      gallery,
      videoPreview: null,
      sizes: p.sizes,
      colors: p.colors || [],
      tags: p.tags || [],
      customizable: Boolean(p.customizable),
      limitedEdition: Boolean(p.limitedEdition),
      piecesRemaining: p.piecesRemaining ?? null,
      rating: p.rating ?? null,
      verified: Boolean(p.verified),
      description: p.description,
      story: p.story ?? null,
      craftOrigin: p.craftOrigin ?? null,
      material: p.material ?? null,
      technique: p.technique ?? null,
      fit: p.fit ?? null,
      occasion: p.occasion ?? null,
      deliveryText: p.deliveryText ?? null,
      designer: {
        id: designer?.id || p.designerId,
        name: designer?.name || p.designerName,
        handle: designer?.handle || "designer",
        logo: designer?.logo || "",
        verified: Boolean(designer?.verified),
      },
    };
  }
  try {
    return await getJson<ProductDetailDTO>(
      `/api/products/${encodeURIComponent(id)}`
    );
  } catch {
    return null;
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  const detail = await getProductDetail(id);
  return detail ? productDetailToUiProduct(detail) : null;
}

export async function listProductsByDesigner(
  designerId: string
): Promise<Product[]> {
  if (!isRemoteApiEnabled()) return getProductsByDesigner(designerId);
  const page = await listProductCards({
    limit: 100,
    filters: { designer: designerId },
  });
  return page.items.map(productCardToUiProduct);
}

export async function listProductsByCategory(
  category: string
): Promise<Product[]> {
  if (!isRemoteApiEnabled()) return getProductsByCategory(category);
  const page = await listProductCards({
    limit: 100,
    filters: { category },
  });
  return page.items.map(productCardToUiProduct);
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

export { productCardToUiProduct, productDetailToUiProduct };
