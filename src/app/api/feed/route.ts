import { PublicCatalogService } from "@/server/services/public-catalog-service";
import { ok, fail } from "@/server/utils/api-response";
import { parseLimit } from "@/server/utils/validation";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "feed");
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"), 10, 50);
    const cursor = searchParams.get("cursor");
    const data = await new PublicCatalogService().listFeed({ limit, cursor });
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
