import { PublicCatalogService } from "@/server/services/public-catalog-service";
import { getOptionalAuthUser } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { parseLimit } from "@/server/utils/validation";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "feed");
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"), 10, 50);
    const cursor = searchParams.get("cursor");
    const sortParam = searchParams.get("sort") || "recent";
    const allowed = new Set(["recent", "popular", "trending", "following"]);
    const sort = allowed.has(sortParam)
      ? (sortParam as "recent" | "popular" | "trending" | "following")
      : "recent";

    const viewer = await getOptionalAuthUser().catch(() => null);
    const data = await new PublicCatalogService().listFeed({
      limit,
      cursor,
      sort,
      viewerUserId: viewer?.id ?? null,
    });
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
