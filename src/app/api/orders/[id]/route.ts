import { OrderService } from "@/server/services/order-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

const orders = new OrderService();

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/orders/[id] */
export async function GET(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "orders:detail");
    const { id } = await ctx.params;
    const user = await requireBuyerContext();
    const order = await orders.get(user.id, id);
    return ok({ order });
  } catch (error) {
    return fail(error);
  }
}
