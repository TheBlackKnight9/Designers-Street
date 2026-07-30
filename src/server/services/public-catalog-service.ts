import { ProductRepository } from "@/server/repositories/product-repository";
import { FeedRepository } from "@/server/repositories/feed-repository";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError } from "@/server/errors";
import {
  toCategoryDTO,
  toFeedPostDTO,
  toProductCardDTO,
  toProductDetailDTO,
} from "@/server/dto/mappers";
import type {
  CategoryDTO,
  CursorPage,
  FeedPostDTO,
  ProductCardDTO,
  ProductDetailDTO,
  PublicProductFilters,
} from "@/server/dto/public";
import {
  CATEGORIES,
  FEED_POSTS,
  PRODUCTS,
  getProductById,
  getDesignerById,
} from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { trackPublicEvent } from "@/server/utils/public-analytics";

function mockCardFromProduct(p: Product): ProductCardDTO {
  const designer = getDesignerById(p.designerId);
  const gallery = (p.images || []).map((url, i) => ({
    id: `${p.id}-img-${i}`,
    type: "image" as const,
    url,
    thumbnailUrl: null,
    displayOrder: i,
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
    verified: Boolean(p.verified ?? designer?.verified),
  };
}

function applyMockFilters(
  products: Product[],
  filters: PublicProductFilters
): Product[] {
  return products.filter((p) => {
    if (filters.category) {
      const c = filters.category.toLowerCase();
      const hit =
        p.category.toLowerCase() === c ||
        p.subcategory?.toLowerCase() === c ||
        p.tags?.some((t) => t.toLowerCase() === c);
      if (!hit) return false;
    }
    if (filters.designer) {
      const d = filters.designer.toLowerCase();
      const house = getDesignerById(p.designerId);
      if (
        p.designerId.toLowerCase() !== d &&
        house?.handle.toLowerCase() !== d
      ) {
        return false;
      }
    }
    if (filters.tag && !p.tags?.includes(filters.tag)) return false;
    if (filters.color && !p.colors?.includes(filters.color)) return false;
    if (filters.size && !p.sizes.includes(filters.size)) return false;
    if (filters.customizable === true && !p.customizable) return false;
    if (filters.customizable === false && p.customizable) return false;
    if (filters.minPrice != null && p.price < filters.minPrice) return false;
    if (filters.maxPrice != null && p.price > filters.maxPrice) return false;
    return true;
  });
}

function mockCursorPage<T extends { id: string }>(
  items: T[],
  limit: number,
  cursor?: string | null
): CursorPage<T> {
  const start = cursor ? items.findIndex((i) => i.id === cursor) + 1 : 0;
  const safe = start < 0 ? 0 : start;
  const page = items.slice(safe, safe + limit);
  const nextCursor =
    safe + limit < items.length ? page[page.length - 1]?.id ?? null : null;
  return { items: page, nextCursor };
}

/**
 * Public marketplace façade — only customer-visible data.
 * Dashboard APIs must not call this; dashboard uses DashboardProductService.
 */
export class PublicCatalogService {
  private products = new ProductRepository();
  private feed = new FeedRepository();

  async listProducts(options: {
    limit?: number;
    cursor?: string | null;
    filters?: PublicProductFilters;
  } = {}): Promise<CursorPage<ProductCardDTO>> {
    const limit = options.limit ?? 24;
    const filters = options.filters ?? {};
    // featured/trending are placeholders → newest
    void filters.sort;

    if (!isDatabaseEnabled()) {
      const filtered = applyMockFilters(PRODUCTS, filters);
      const page = mockCursorPage(filtered, limit, options.cursor);
      return {
        items: page.items.map(mockCardFromProduct),
        nextCursor: page.nextCursor,
      };
    }

    const { rows, nextCursor } = await this.products.findPublicPage({
      limit,
      cursor: options.cursor,
      filters,
    });

    return {
      items: rows.map(toProductCardDTO),
      nextCursor,
    };
  }

  async getProduct(id: string): Promise<ProductDetailDTO> {
    trackPublicEvent("product_viewed", { productId: id });

    if (!isDatabaseEnabled()) {
      const p = getProductById(id);
      if (!p) throw new NotFoundError(`Product ${id} not found`);
      const designer = getDesignerById(p.designerId);
      const card = mockCardFromProduct(p);
      return {
        ...card,
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
          handle: designer?.handle || p.designerName.toLowerCase(),
          logo: designer?.logo || "",
          verified: Boolean(designer?.verified),
        },
      };
    }

    const row = await this.products.findPublicById(id);
    if (!row) throw new NotFoundError(`Product ${id} not found`);
    return toProductDetailDTO(row);
  }

  async listFeed(options: {
    limit?: number;
    cursor?: string | null;
  } = {}): Promise<CursorPage<FeedPostDTO>> {
    trackPublicEvent("feed_viewed");
    const limit = options.limit ?? 10;

    if (!isDatabaseEnabled()) {
      const page = mockCursorPage(FEED_POSTS, limit, options.cursor);
      return { items: page.items, nextCursor: page.nextCursor };
    }

    // Product-backed feed via public product page (decoupled from Post table)
    const { rows, nextCursor } = await this.products.findPublicPage({
      limit,
      cursor: options.cursor,
      filters: { sort: "newest" },
    });

    return {
      items: rows.map(toFeedPostDTO),
      nextCursor,
    };
  }

  async listCategories(): Promise<CategoryDTO[]> {
    trackPublicEvent("category_viewed");
    if (!isDatabaseEnabled()) {
      return CATEGORIES.map(toCategoryDTO);
    }
    const tree = await this.feed.findCategoryTree();
    return tree.map(toCategoryDTO);
  }
}
