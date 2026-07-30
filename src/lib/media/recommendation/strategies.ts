import type { MediaPoolEntry, RecommendationStrategyId } from "./types";

function overlaps(a?: string[], b?: string[]): number {
  if (!a?.length || !b?.length) return 0;
  const set = new Set(a.map((t) => t.toLowerCase()));
  return b.reduce((n, t) => n + (set.has(t.toLowerCase()) ? 1 : 0), 0);
}

export function filterUnseen(
  pool: MediaPoolEntry[],
  exclude: Set<string>
): MediaPoolEntry[] {
  return pool.filter((m) => !exclude.has(m.id));
}

export function sameProductVideos(
  pool: MediaPoolEntry[],
  current: MediaPoolEntry,
  exclude: Set<string>
): MediaPoolEntry[] {
  if (!current.productId) return [];
  return filterUnseen(pool, exclude).filter(
    (m) =>
      m.type === "video" &&
      m.productId === current.productId &&
      m.id !== current.id
  );
}

export function sameDesignerVideos(
  pool: MediaPoolEntry[],
  current: MediaPoolEntry,
  exclude: Set<string>
): MediaPoolEntry[] {
  if (!current.designerId) return [];
  return filterUnseen(pool, exclude).filter(
    (m) =>
      m.type === "video" &&
      m.designerId === current.designerId &&
      m.productId !== current.productId
  );
}

export function similarProductVideos(
  pool: MediaPoolEntry[],
  current: MediaPoolEntry,
  exclude: Set<string>
): MediaPoolEntry[] {
  const candidates = filterUnseen(pool, exclude).filter(
    (m) =>
      m.type === "video" &&
      m.id !== current.id &&
      m.designerId !== current.designerId
  );

  return candidates
    .map((m) => {
      let score = 0;
      if (current.category && m.category === current.category) score += 4;
      score += overlaps(current.tags, m.tags) * 2;
      score += overlaps(current.colors, m.colors);
      if (
        current.price != null &&
        m.price != null &&
        Math.abs(current.price - m.price) / Math.max(current.price, 1) < 0.35
      ) {
        score += 2;
      }
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.m);
}

export function imageFallback(
  pool: MediaPoolEntry[],
  current: MediaPoolEntry,
  exclude: Set<string>
): MediaPoolEntry[] {
  const images = filterUnseen(pool, exclude).filter((m) => m.type === "image");

  // Prefer same designer / category images first
  const scored = images.map((m) => {
    let score = 0;
    if (current.designerId && m.designerId === current.designerId) score += 3;
    if (current.category && m.category === current.category) score += 2;
    score += overlaps(current.tags, m.tags);
    return { m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((x) => x.m);
}

export const STRATEGY_ORDER: RecommendationStrategyId[] = [
  "same_product",
  "same_designer",
  "similar_products",
  "image_fallback",
];
