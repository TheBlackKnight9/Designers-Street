"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isRemoteApiEnabled,
  listProducts,
  listCategories,
  listDesigners,
  listFeed,
  getProduct,
} from "@/lib/api/catalog";
import type { Product, Category, DesignerHouse, FeedPostData } from "@/lib/types";
import { normalizeFeedPosts } from "@/lib/feed-product";
import type { PublicProductFilters } from "@/server/dto/public";

export type CatalogLoadState = {
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/** Products for storefront when API mode is on; otherwise caller should use DataContext. */
export function useStorefrontProducts(options?: {
  filters?: PublicProductFilters;
  limit?: number;
}): CatalogLoadState & { products: Product[]; enabled: boolean } {
  const enabled = isRemoteApiEnabled();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const filtersKey = JSON.stringify(options?.filters ?? {});
  const limit = options?.limit ?? 100;

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listProducts({
      limit,
      filters: options?.filters,
    })
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filtersKey captures filters
  }, [enabled, filtersKey, limit, tick]);

  return { products, loading, error, reload, enabled };
}

export function useStorefrontCategories(): CatalogLoadState & {
  categories: Category[];
  enabled: boolean;
} {
  const enabled = isRemoteApiEnabled();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listCategories()
      .then((items) => {
        if (!cancelled) setCategories(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load categories");
          setCategories([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, tick]);

  return { categories, loading, error, reload, enabled };
}

export function useStorefrontDesigners(): CatalogLoadState & {
  designers: DesignerHouse[];
  enabled: boolean;
} {
  const enabled = isRemoteApiEnabled();
  const [designers, setDesigners] = useState<DesignerHouse[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listDesigners()
      .then((items) => {
        if (!cancelled) setDesigners(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load designers");
          setDesigners([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, tick]);

  return { designers, loading, error, reload, enabled };
}

export function useStorefrontProduct(productId: string): CatalogLoadState & {
  product: Product | null;
  enabled: boolean;
} {
  const enabled = isRemoteApiEnabled();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProduct(productId)
      .then((p) => {
        if (!cancelled) setProduct(p);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load product");
          setProduct(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, productId, tick]);

  return { product, loading, error, reload, enabled };
}

export function useStorefrontFeed(
  pageSize = 8,
  sort: "recent" | "popular" | "trending" | "following" = "recent"
): CatalogLoadState & {
  posts: FeedPostData[];
  hasMore: boolean;
  loadMore: () => void;
  loadingMore: boolean;
} {
  const [posts, setPosts] = useState<FeedPostData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const loadingMoreRef = useRef(false);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listFeed({ limit: pageSize, sort })
      .then((page) => {
        if (!cancelled) {
          setPosts(normalizeFeedPosts(page.items));
          setNextCursor(page.nextCursor);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load feed");
          setPosts([]);
          setNextCursor(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pageSize, sort, tick]);

  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    listFeed({ limit: pageSize, cursor: nextCursor, sort })
      .then((page) => {
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const add = normalizeFeedPosts(
            (page.items || []).filter((p) => p.id && !seen.has(p.id))
          );
          return add.length ? [...prev, ...add] : prev;
        });
        setNextCursor(page.nextCursor);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load more");
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [nextCursor, pageSize, sort]);

  return {
    posts,
    loading,
    error,
    reload,
    hasMore: Boolean(nextCursor),
    loadMore,
    loadingMore,
  };
}

/** Designer public profile + products when API mode is on. */
export function useStorefrontDesigner(handle: string): CatalogLoadState & {
  designer: DesignerHouse | null;
  products: Product[];
  enabled: boolean;
} {
  const enabled = isRemoteApiEnabled();
  const [designer, setDesigner] = useState<DesignerHouse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled || !handle) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { getDesignerByHandleApi } = await import("@/lib/api/catalog");
        const d = await getDesignerByHandleApi(handle);
        if (cancelled) return;
        setDesigner(d);
        if (d) {
          const items = await listProducts({
            limit: 48,
            filters: { designer: d.id },
          });
          if (!cancelled) setProducts(items);
        } else {
          setProducts([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setDesigner(null);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, handle, tick]);

  return { designer, products, loading, error, reload, enabled };
}
