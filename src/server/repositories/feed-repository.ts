import { prisma } from "@/server/db";
import { toFeedPost, toStoryItem, buildCategoryTree } from "@/server/utils/mappers";
import type { Category, FeedPostData, StoryItem } from "@/lib/types";
import type { FeedPage } from "@/server/types";

export class FeedRepository {
  async findFeedPage(options: {
    limit: number;
    cursor?: string | null;
  }): Promise<FeedPage> {
    const limit = options.limit;
    const rows = await prisma.post.findMany({
      take: limit + 1,
      ...(options.cursor
        ? {
            cursor: { id: options.cursor },
            skip: 1,
          }
        : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

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
