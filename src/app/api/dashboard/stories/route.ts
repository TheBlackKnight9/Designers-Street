import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

/** GET /api/dashboard/stories - List stories for designer */
export async function GET() {
  try {
    const ctx = await requireDashboardContext();
    const stories = await prisma.story.findMany({
      where: { designerId: ctx.designer.id },
      include: { slides: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return ok({ stories });
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
    const expiresAt = isHighlight ? null : new Date(Date.now() + durationHours * 3600 * 1000);

    const story = await prisma.story.create({
      data: {
        id: storyId,
        designerId: ctx.designer.id,
        label,
        expiresAt,
        slides: {
          create: slidesInput.slice(0, 10).map((s: any, idx: number) => ({
            position: idx,
            image: String(s.image || s.url || "").trim() || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
            videoUrl: s.videoUrl ? String(s.videoUrl).trim() : null,
            caption: s.caption ? String(s.caption).trim() : null,
            ctaLabel: s.ctaLabel ? String(s.ctaLabel).trim() : null,
            ctaLink: s.ctaLink ? String(s.ctaLink).trim() : null,
          })),
        },
      },
      include: { slides: true },
    });

    return ok({ story }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
