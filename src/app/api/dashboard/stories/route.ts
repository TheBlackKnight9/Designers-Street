import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

// In-memory store for high-availability studio story fallback
export const MEM_STORIES: any[] = [];

/** GET /api/dashboard/stories - List stories for designer */
export async function GET() {
  try {
    const ctx = await requireDashboardContext();
    let dbStories: any[] = [];

    try {
      dbStories = await prisma.story.findMany({
        where: { designerId: ctx.designer.id },
        include: { slides: { orderBy: { position: "asc" } } },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      /* fallback */
    }

    const designerMemStories = MEM_STORIES.filter((s) => s.designerId === ctx.designer.id);
    const merged = [...designerMemStories];
    for (const s of dbStories) {
      if (!merged.some((m) => m.id === s.id)) {
        merged.push(s);
      }
    }

    return ok({ stories: merged });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/dashboard/stories - Create story with nested slides */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "dashboard:stories");
    const ctx = await requireDashboardContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const label = String(body.label || "Story Highlights").trim();
    const durationHours = Number(body.durationHours || 24);
    const isHighlight = Boolean(body.isHighlight);

    const slidesInput = Array.isArray(body.slides) ? body.slides : [];

    if (slidesInput.length === 0) {
      throw new ValidationError("At least 1 slide is required to publish a story");
    }

    const storyId = `story_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const expiresAt = isHighlight ? null : new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

    const formattedSlides = slidesInput.slice(0, 10).map((s: any, idx: number) => ({
      id: `slide_${storyId}_${idx}`,
      position: idx,
      image: String(s.image || s.url || "").trim() || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
      videoUrl: s.videoUrl ? String(s.videoUrl).trim() : null,
      caption: s.caption ? String(s.caption).trim() : null,
      ctaLabel: s.ctaLabel ? String(s.ctaLabel).trim() : null,
      ctaLink: s.ctaLink ? String(s.ctaLink).trim() : null,
    }));

    const newStoryObj = {
      id: storyId,
      designerId: ctx.designer.id,
      label,
      expiresAt,
      createdAt: new Date().toISOString(),
      designer: {
        id: ctx.designer.id,
        name: ctx.designer.name,
        logo: ctx.designer.logo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      },
      slides: formattedSlides,
    };

    try {
      await prisma.story.create({
        data: {
          id: storyId,
          designerId: ctx.designer.id,
          label,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          slides: {
            create: formattedSlides.map((s) => ({
              position: s.position,
              image: s.image,
              videoUrl: s.videoUrl,
              caption: s.caption,
              ctaLabel: s.ctaLabel,
              ctaLink: s.ctaLink,
            })),
          },
        },
        include: { slides: true },
      });
    } catch {
      /* fallback */
    }

    MEM_STORIES.unshift(newStoryObj);

    return ok({ story: newStoryObj }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
