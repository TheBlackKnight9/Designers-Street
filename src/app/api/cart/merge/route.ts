import { CartService } from "@/server/services/cart-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { getGuestToken } from "@/server/utils/guest-token";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

const carts = new CartService();

/** POST /api/cart/merge — merge guest cookie cart into user cart */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "cart:merge");
    const user = await requireBuyerContext();
    const guestToken = await getGuestToken();
    if (!guestToken) {
      return ok(await carts.getCart({ userId: user.id }));
    }
    const data = await carts.mergeGuestIntoUser(user.id, guestToken);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
