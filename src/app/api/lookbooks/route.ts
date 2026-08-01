import { LookbookService } from "@/server/services/luxury-service";
import { ValidationError } from "@/server/errors";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

const lookbooks = new LookbookService();

/** GET /api/lookbooks?designerId= */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "lookbooks:list");
    const { searchParams } = new URL(request.url);
    const designerId = searchParams.get("designerId");
    if (!designerId) {
      throw new ValidationError("designerId is required");
    }
    const items = await lookbooks.listByDesigner(designerId);
    return ok({ items });
  } catch (error) {
    return fail(error);
  }
}
