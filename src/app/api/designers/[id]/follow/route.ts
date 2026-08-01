import { FollowService } from "@/server/services/follow-service";
import {
  getOptionalAuthUser,
  requireBuyerContext,
} from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };
const follows = new FollowService();

/** GET /api/designers/[id]/follow — follow status + counts */
export async function GET(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "follows:get");
    const { id } = await ctx.params;
    const user = await getOptionalAuthUser().catch(() => null);
    const status = await follows.status(user?.id ?? null, id);
    return ok(status);
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/designers/[id]/follow — toggle follow */
export async function POST(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "follows:mutate");
    const { id } = await ctx.params;
    const user = await requireBuyerContext();
    const result = await follows.toggle(user.id, id);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
