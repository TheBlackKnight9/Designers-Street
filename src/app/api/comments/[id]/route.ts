import { CommentService } from "@/server/services/comment-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { requireString } from "@/server/utils/validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };
const comments = new CommentService();

/** PATCH /api/comments/[id] — edit own comment */
export async function PATCH(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "comments:mutate");
    const { id } = await ctx.params;
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as { body?: string };
    const text = requireString(body.body, "body");
    const comment = await comments.update(user.id, id, text);
    return ok({ comment });
  } catch (error) {
    return fail(error);
  }
}

/** DELETE /api/comments/[id] — delete own comment */
export async function DELETE(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "comments:mutate");
    const { id } = await ctx.params;
    const user = await requireBuyerContext();
    const result = await comments.remove(user.id, id);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
