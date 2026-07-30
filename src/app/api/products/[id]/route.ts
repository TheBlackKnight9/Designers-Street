import { PublicCatalogService } from "@/server/services/public-catalog-service";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    enforcePublicRateLimit(request, "products");
    const { id } = await params;
    const data = await new PublicCatalogService().getProduct(id);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
