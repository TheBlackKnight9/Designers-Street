import { LookbookService } from "@/server/services/luxury-service";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

const lookbooks = new LookbookService();

/** GET /api/lookbooks/[designerId]/[slug] */
export async function GET(
  request: Request,
  ctx: { params: Promise<{ designerId: string; slug: string }> }
) {
  try {
    enforcePublicRateLimit(request, "lookbooks:get");
    const { designerId, slug } = await ctx.params;
    const item = await lookbooks.getBySlug(designerId, slug);
    return ok(item);
  } catch (error) {
    return fail(error);
  }
}
