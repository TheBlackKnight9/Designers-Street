import { WishlistService } from "@/server/services/wishlist-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";
const wishlists = new WishlistService();

/** POST /api/wishlist/merge — Merge guest localStorage wishlist items to database upon login */
export async function POST(request: Request) {
  try {
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const productIds = Array.isArray(body.productIds)
      ? (body.productIds as string[]).map((id) => String(id))
      : [];

    const ids = await wishlists.merge(user.id, productIds);
    return ok({ ids });
  } catch (error) {
    return fail(error);
  }
}
