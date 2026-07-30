import { FeedRepository } from "@/server/repositories";
import { isDatabaseEnabled } from "@/server/utils/env";
import { CATEGORIES, FEED_POSTS, STORIES } from "@/lib/mock-data";
import type { Category, StoryItem } from "@/lib/types";
import type { FeedPage } from "@/server/types";

const repo = new FeedRepository();

function mockFeedPage(limit: number, cursor?: string | null): FeedPage {
  const start = cursor
    ? FEED_POSTS.findIndex((p) => p.id === cursor) + 1
    : 0;
  const safeStart = start < 0 ? 0 : start;
  const slice = FEED_POSTS.slice(safeStart, safeStart + limit);
  const next =
    safeStart + limit < FEED_POSTS.length
      ? slice[slice.length - 1]?.id ?? null
      : null;
  return { items: slice, nextCursor: next };
}

export class FeedService {
  async getFeed(options: {
    limit?: number;
    cursor?: string | null;
  } = {}): Promise<FeedPage> {
    const limit = options.limit ?? 10;
    if (!isDatabaseEnabled()) return mockFeedPage(limit, options.cursor);
    return repo.findFeedPage({ limit, cursor: options.cursor });
  }

  async getStories(): Promise<StoryItem[]> {
    if (!isDatabaseEnabled()) return STORIES;
    return repo.findAllStories();
  }

  async getCategories(): Promise<Category[]> {
    if (!isDatabaseEnabled()) return CATEGORIES;
    return repo.findCategoryTree();
  }
}
