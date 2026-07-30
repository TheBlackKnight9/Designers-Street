import { prisma } from "@/server/db";
import { toFeedPost, toStoryItem, buildCategoryTree } from "@/server/utils/mappers";
import type { Category, FeedPostData, StoryItem } from "@/lib/types";
import type { FeedPage } from "@/server/types";

export type FeedSort = "recent" | "popular" | "trending" | "following";

export class FeedRepository {
  async findFeedPage(options: {
    limit: number;
    cursor?: string | null;
    sort?: FeedSort;
    followingDesignerIds?: string[];
  }): Promise<FeedPage> {
    const limit = options.limit;
    const sort = options.sort ?? "recent";

    if (sort === "following" && options.followingDesignerIds?.length) {
      const rows = await prisma.post.findMany({
        where: { designerId: { in: options.followingDesignerIds } },
        take: limit + 1,
        ...(options.cursor
          ? { cursor: { id: options.cursor }, skip: 1 }
          : {}),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      return this.pageFromRows(rows, limit);
    }

    if (sort === "popular" || sort === "trending") {
      // Weighted engagement: pull a window, score in memory (YAGNI — no materialized score yet)
      const window = Math.min(Math.max(limit * 4, 40), 120);
      const rows = await prisma.post.findMany({
        take: window,
        orderBy: [{ likesCount: "desc" }, { commentsCount: "desc" }, { createdAt: "desc" }],
      });
      const now = Date.now();
      const scored = rows
        .map((row) => {
          const ageHours = Math.max(
            1,
            (now - row.createdAt.getTime()) / (1000 * 60 * 60)
          );
          const engagement =
            row.likesCount * 2 + row.commentsCount * 3;
          const score =
            sort === "trending"
              ? engagement / Math.pow(ageHours, 0.6)
              : engagement;
          return { row, score };
        })
        .sort((a, b) => b.score - a.score || b.row.createdAt.getTime() - a.row.createdAt.getTime());

      let start = 0;
      if (options.cursor) {
        const idx = scored.findIndex((s) => s.row.id === options.cursor);
        start = idx >= 0 ? idx + 1 : 0;
      }
      const slice = scored.slice(start, start + limit + 1).map((s) => s.row);
      return this.pageFromRows(slice, limit);
    }

    // recent (default)
    const rows = await prisma.post.findMany({
      take: limit + 1,
      ...(options.cursor
        ? { cursor: { id: options.cursor }, skip: 1 }
        : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    return this.pageFromRows(rows, limit);
  }

  private pageFromRows(
    rows: Parameters<typeof toFeedPost>[0][],
    limit: number
  ): FeedPage {
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const items: FeedPostData[] = slice.map(toFeedPost);
    const nextCursor = hasMore ? slice[slice.length - 1]?.id ?? null : null;
    return { items, nextCursor };
  }

  async findAllStories(): Promise<StoryItem[]> {
    const rows = await prisma.story.findMany({
      include: {
        slides: true,
        designer: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toStoryItem);
  }

  async findCategoryTree(): Promise<Category[]> {
    const rows = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    });
    return buildCategoryTree(rows);
  }
}
