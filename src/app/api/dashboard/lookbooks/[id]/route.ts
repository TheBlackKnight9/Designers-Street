import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { LookbookRepository } from "@/server/repositories/luxury-repository";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

const lookbookRepo = new LookbookRepository();

type Ctx = { params: Promise<{ id: string }> };

/** PUT /api/dashboard/lookbooks/[id] — update lookbook */
export async function PUT(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "dashboard:lookbooks:update");
    const { id } = await ctx.params;
    const dashCtx = await requireDashboardContext();
    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      coverImage?: string;
      description?: string;
      published?: boolean;
    };

    const updated = await lookbookRepo.update(id, dashCtx.designer.id, {
      ...(body.title ? { title: body.title } : {}),
      ...(body.coverImage ? { coverImage: body.coverImage } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.published !== undefined ? { published: body.published } : {}),
    });

    return ok({ lookbook: updated });
  } catch (error) {
    return fail(error);
  }
}

/** DELETE /api/dashboard/lookbooks/[id] — delete lookbook */
export async function DELETE(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "dashboard:lookbooks:delete");
    const { id } = await ctx.params;
    const dashCtx = await requireDashboardContext();
    await lookbookRepo.delete(id, dashCtx.designer.id);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
