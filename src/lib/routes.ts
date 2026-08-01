/**
 * Centralised routing helpers for Designer's Street.
 *
 * All designer navigation MUST go through getDesignerUrl() so that if the URL
 * strategy ever changes (e.g. handle → numeric slug, or path prefix change)
 * there is exactly ONE place to update.
 *
 * Canonical resolution order for a designer segment:
 *   1. handle  — the preferred, human-readable URL key
 *   2. id      — fallback when handle is unavailable (e.g. API-only objects)
 *
 * Display name is intentionally excluded — it is not unique and must never
 * appear as a URL segment.
 */

// ─── Designer routes ─────────────────────────────────────────────────────────

/**
 * Returns the canonical URL for a designer house profile.
 *
 * @param handleOrId  The designer's `handle` (preferred) or `id` (fallback).
 *                    Pass `null | undefined` to receive `null` — callers should
 *                    decide the appropriate fallback (e.g. "#" or "/store").
 */
export function getDesignerUrl(handleOrId: string | null | undefined): string | null {
  if (!handleOrId) return null;
  return `/designer/${encodeURIComponent(handleOrId)}`;
}

/**
 * Returns the canonical URL for a specific lookbook inside a designer house.
 *
 * @param handleOrId  The designer's handle or id.
 * @param lookbookSlug  The lookbook's slug.
 */
export function getDesignerLookbookUrl(
  handleOrId: string | null | undefined,
  lookbookSlug: string
): string | null {
  const base = getDesignerUrl(handleOrId);
  if (!base) return null;
  return `${base}/lookbooks/${encodeURIComponent(lookbookSlug)}`;
}

// ─── Product routes ───────────────────────────────────────────────────────────

/**
 * Returns the canonical URL for a product detail page.
 */
export function getProductUrl(productId: string | null | undefined): string | null {
  if (!productId) return null;
  return `/product/${encodeURIComponent(productId)}`;
}

// ─── Collection / Editorial routes ───────────────────────────────────────────

/**
 * Returns the canonical URL for a curated editorial collection.
 */
export function getCollectionUrl(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return `/collections/${encodeURIComponent(slug)}`;
}

/**
 * Returns the canonical URL for an editorial article.
 */
export function getArticleUrl(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return `/editorial/${encodeURIComponent(slug)}`;
}
