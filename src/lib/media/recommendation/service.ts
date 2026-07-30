import type { ViewerMediaItem } from "@/lib/media/types";
import { getMediaPool } from "./catalog";
import {
  STRATEGY_ORDER,
  imageFallback,
  sameDesignerVideos,
  sameProductVideos,
  similarProductVideos,
} from "./strategies";
import type {
  MediaPoolEntry,
  MediaRecommendationPage,
  MediaRecommendationSeed,
  RecommendationStrategyId,
} from "./types";

function encodeCursor(
  strategyIndex: number,
  offset: number
): string {
  return `${strategyIndex}:${offset}`;
}

function decodeCursor(cursor?: string | null): {
  strategyIndex: number;
  offset: number;
} {
  if (!cursor) return { strategyIndex: 0, offset: 0 };
  const [s, o] = cursor.split(":");
  return {
    strategyIndex: Number(s) || 0,
    offset: Number(o) || 0,
  };
}

function toViewer(entry: MediaPoolEntry): ViewerMediaItem {
  return {
    id: entry.id,
    type: entry.type,
    url: entry.url,
    thumbnailUrl: entry.thumbnailUrl,
    publicId: entry.publicId,
    alt: entry.alt,
    productId: entry.productId,
    postId: entry.postId,
    designerId: entry.designerId,
    category: entry.category,
    tags: entry.tags,
    price: entry.price,
    colors: entry.colors,
  };
}

function enrichCurrent(current: ViewerMediaItem): MediaPoolEntry {
  const pool = getMediaPool();
  const found = pool.find((m) => m.id === current.id);
  if (found) return { ...found, ...current };
  return {
    ...current,
    designerId: current.designerId,
    category: current.category,
    tags: current.tags,
    price: current.price,
    colors: current.colors,
  };
}

function runStrategy(
  id: RecommendationStrategyId,
  pool: MediaPoolEntry[],
  current: MediaPoolEntry,
  exclude: Set<string>
): MediaPoolEntry[] {
  switch (id) {
    case "same_product":
      return sameProductVideos(pool, current, exclude);
    case "same_designer":
      return sameDesignerVideos(pool, current, exclude);
    case "similar_products":
      return similarProductVideos(pool, current, exclude);
    case "image_fallback":
      return imageFallback(pool, current, exclude);
    default:
      return [];
  }
}

/**
 * MediaRecommendationService — viewer asks for "next media" only.
 * Strategies can later include AI / personalization without changing MediaViewer.
 */
export class MediaRecommendationService {
  private sessionSeen = new Set<string>();
  /** Last continuous seed (product / post / media) — used for smart queue reset */
  private activeSeedKey: string | null = null;

  remember(ids: string[]) {
    for (const id of ids) this.sessionSeen.add(id);
  }

  resetSession() {
    this.sessionSeen.clear();
    this.activeSeedKey = null;
  }

  /**
   * Start a continuous discovery session for this seed.
   * Always clears prior queue memory so a new open never continues an old journey.
   * When the seed product/post differs from the last session, that reset is required
   * so Priority 1–4 rebuild from the newly tapped product.
   */
  beginContinuousSession(seedKey: string): { seedChanged: boolean } {
    const seedChanged =
      this.activeSeedKey != null && this.activeSeedKey !== seedKey;
    this.sessionSeen.clear();
    this.activeSeedKey = seedKey;
    return { seedChanged };
  }

  getActiveSeedKey(): string | null {
    return this.activeSeedKey;
  }

  /**
   * Fetch the next page of recommended media after `seed.current`.
   * Cursor encodes strategy index + offset within that strategy bucket.
   */
  recommend(seed: MediaRecommendationSeed): MediaRecommendationPage {
    const limit = seed.limit ?? 5;
    const pool = getMediaPool();
    const current = enrichCurrent(seed.current);
    const exclude = new Set<string>([
      ...this.sessionSeen,
      ...(seed.excludeIds ?? []),
      current.id,
    ]);

    let { strategyIndex, offset } = decodeCursor(seed.cursor);
    const out: ViewerMediaItem[] = [];

    while (out.length < limit && strategyIndex < STRATEGY_ORDER.length) {
      const strategyId = STRATEGY_ORDER[strategyIndex];
      const bucket = runStrategy(strategyId, pool, current, exclude);
      const slice = bucket.slice(offset, offset + (limit - out.length));

      for (const entry of slice) {
        exclude.add(entry.id);
        this.sessionSeen.add(entry.id);
        out.push(toViewer(entry));
      }

      if (offset + slice.length < bucket.length) {
        // More in this strategy
        return {
          items: out,
          nextCursor: encodeCursor(strategyIndex, offset + slice.length),
        };
      }

      // Advance strategy
      strategyIndex += 1;
      offset = 0;
    }

    return {
      items: out,
      nextCursor:
        strategyIndex < STRATEGY_ORDER.length
          ? encodeCursor(strategyIndex, offset)
          : null,
    };
  }
}

/** Shared singleton for the browser session (avoids repeat within continuous viewing). */
let sharedService: MediaRecommendationService | null = null;

export function getMediaRecommendationService(): MediaRecommendationService {
  if (!sharedService) sharedService = new MediaRecommendationService();
  return sharedService;
}
