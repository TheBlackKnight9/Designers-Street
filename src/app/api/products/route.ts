import { PublicCatalogService } from "@/server/services/public-catalog-service";
import { ok, fail } from "@/server/utils/api-response";
import { parseLimit } from "@/server/utils/validation";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import type {
  PublicProductFilters,
  PublicProductSort,
} from "@/server/dto/public";

export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "products");

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"), 24, 100);
    const cursor = searchParams.get("cursor");

    const sortRaw = searchParams.get("sort");
    const sort: PublicProductSort =
      sortRaw === "featured" || sortRaw === "trending" || sortRaw === "newest"
        ? sortRaw
        : "newest";

    const customizableParam = searchParams.get("customizable");

    const filters: PublicProductFilters = {
      category: searchParams.get("category"),
      designer:
        searchParams.get("designer") || searchParams.get("designerId"),
      tag: searchParams.get("tag"),
      color: searchParams.get("color"),
      size: searchParams.get("size"),
      customizable:
        customizableParam === "true" || customizableParam === "1"
          ? true
          : customizableParam === "false" || customizableParam === "0"
            ? false
            : null,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : null,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : null,
      sort,
    };

    const data = await new PublicCatalogService().listProducts({
      limit,
      cursor,
      filters,
    });

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
