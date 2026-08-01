import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError, NotFoundError, ForbiddenError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/dashboard/posts/[id] */
export async function PATCH(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "dashboard:posts");
    const { id } = await ctx.params;
    const dashCtx = await requireDashboardContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundError(`Post ${id} not found`);
    if (post.designerId !== dashCtx.designer.id) {
      throw new ForbiddenError("You can only modify posts owned by your designer house");
    }

    const caption = typeof body.caption === "string" ? body.caption.trim() : post.caption;
    const tag = typeof body.tag === "string" ? body.tag.trim() : post.tag;
    const productTag = body.productTag !== undefined ? body.productTag : post.productTag;

    const updated = await prisma.post.update({
      where: { id },
      data: {
        caption,
        tag,
        productTag: productTag as any,
      },
    });

    return ok({ post: updated });
  } catch (error) {
    return fail(error);
  }
}

/** DELETE /api/dashboard/posts/[id] */
export async function DELETE(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "dashboard:posts");
    const { id } = await ctx.params;
    const dashCtx = await requireDashboardContext();

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundError(`Post ${id} not found`);
    if (post.designerId !== dashCtx.designer.id) {
      throw new ForbiddenError("You can only delete posts owned by your designer house");
    }

    await prisma.post.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
