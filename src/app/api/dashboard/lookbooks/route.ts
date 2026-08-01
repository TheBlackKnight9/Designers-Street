import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { LookbookService } from "@/server/services/luxury-service";
import { LookbookRepository } from "@/server/repositories/luxury-repository";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

const lookbookService = new LookbookService();
const lookbookRepo = new LookbookRepository();

/** GET /api/dashboard/lookbooks — list designer lookbooks */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "dashboard:lookbooks:list");
    const ctx = await requireDashboardContext();
    const list = await lookbookService.listByDesigner(ctx.designer.id);
    return ok({ lookbooks: list });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/dashboard/lookbooks — create new lookbook */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "dashboard:lookbooks:create");
    const ctx = await requireDashboardContext();
    const body = (await request.json().catch(() => ({}))) as {
      title: string;
      slug: string;
      coverImage: string;
      kind?: "seasonal" | "collection" | "campaign" | "editorial";
      season?: string;
      description?: string;
      items?: Array<{
        mediaUrl: string;
        mediaKind?: "image" | "video";
        caption?: string;
        productId?: string;
      }>;
    };

    if (!body.title || !body.slug || !body.coverImage) {
      return fail(new Error("title, slug, and coverImage are required"));
    }

    const created = await lookbookRepo.create({
      designer: { connect: { id: ctx.designer.id } },
      title: body.title,
      slug: body.slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
      coverImage: body.coverImage,
      kind: body.kind ?? "seasonal",
      season: body.season ?? null,
      description: body.description ?? null,
      items: {
        create: (body.items || []).map((item, idx) => ({
          mediaUrl: item.mediaUrl,
          mediaKind: item.mediaKind ?? "image",
          caption: item.caption ?? null,
          productId: item.productId ?? null,
          displayOrder: idx,
        })),
      },
    });

    return ok({ lookbook: created }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
