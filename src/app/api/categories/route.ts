import { PublicCatalogService } from "@/server/services/public-catalog-service";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "categories");
    const data = await new PublicCatalogService().listCategories();
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
