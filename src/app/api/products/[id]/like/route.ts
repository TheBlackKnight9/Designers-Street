import { LikeService } from "@/server/services/like-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };
const likes = new LikeService();

/** POST /api/products/[id]/like — toggle product like */
export async function POST(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "likes:mutate");
    const { id } = await ctx.params;
    const user = await requireBuyerContext();
    const result = await likes.toggleProduct(user.id, id);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
