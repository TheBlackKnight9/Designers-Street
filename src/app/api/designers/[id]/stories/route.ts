import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { STORIES } from "@/lib/mock-data";
import { toStoryItem } from "@/server/utils/mappers";
import { MEM_STORIES } from "@/app/api/dashboard/stories/route";
import type { StoryItem } from "@/lib/types";

export const runtime = "nodejs";

/** GET /api/designers/[id]/stories - Get unique stories for a specific designer house */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let dbStories: StoryItem[] = [];

    try {
      const rows = await prisma.story.findMany({
        where: {
          OR: [
            { designerId: id },
            { designer: { handle: { equals: id, mode: "insensitive" } } },
            { designer: { name: { equals: id, mode: "insensitive" } } },
          ],
        },
        include: {
          slides: true,
          designer: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (rows.length > 0) {
        dbStories = rows.map((r) => toStoryItem(r as any));
      }
    } catch {
      /* fallback */
    }

    const memMatches: StoryItem[] = MEM_STORIES.filter(
      (s) =>
        s.designerId === id ||
        s.designer?.handle?.toLowerCase() === id.toLowerCase() ||
        s.designer?.name?.toLowerCase() === id.toLowerCase()
    ).map((s) => ({
      id: s.id,
      designerId: s.designerId,
      designerName: s.designer?.name || "Atelier",
      designerLogo: s.designer?.logo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      label: s.label,
      slides: s.slides.map((sl: any) => ({
        image: sl.image,
        caption: sl.caption,
        ctaLabel: sl.ctaLabel,
        ctaLink: sl.ctaLink,
      })),
    }));

    const mockMatches = STORIES.filter(
      (s) =>
        s.designerId === id ||
        s.designerName?.toLowerCase() === id.toLowerCase()
    );

    const storyMap = new Map<string, StoryItem>();
    for (const story of memMatches) {
      storyMap.set(story.id, story);
    }
    for (const story of dbStories) {
      if (!storyMap.has(story.id)) {
        storyMap.set(story.id, story);
      }
    }
    for (const mock of mockMatches) {
      if (!storyMap.has(mock.id)) {
        storyMap.set(mock.id, mock);
      }
    }

    const uniqueStories = Array.from(storyMap.values());
    return ok(uniqueStories);
  } catch (error) {
    return fail(error);
  }
}
