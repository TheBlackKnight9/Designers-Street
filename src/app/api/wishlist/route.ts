import { WishlistService } from "@/server/services/wishlist-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { requireString } from "@/server/utils/validation";

export const runtime = "nodejs";

const wishlists = new WishlistService();

/** GET /api/wishlist */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "wishlist:get");
    const user = await requireBuyerContext();
    const ids = await wishlists.listIds(user.id);
    return ok({ ids });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/wishlist — toggle { productId } */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "wishlist:mutate");
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const productId = requireString(body.productId, "productId");
    const result = await wishlists.toggle(user.id, productId);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
