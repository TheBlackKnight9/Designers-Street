import { WishlistService } from "@/server/services/wishlist-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

const wishlists = new WishlistService();

/** POST /api/wishlist/merge — { productIds: string[] } from guest localStorage */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "wishlist:merge");
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as {
      productIds?: unknown;
    };
    if (!Array.isArray(body.productIds)) {
      throw new ValidationError("productIds must be an array");
    }
    const productIds = body.productIds.filter(
      (id): id is string => typeof id === "string" && id.length > 0
    );
    const ids = await wishlists.merge(user.id, productIds);
    return ok({ ids });
  } catch (error) {
    return fail(error);
  }
}
