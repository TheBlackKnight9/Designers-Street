import { OrderService } from "@/server/services/order-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

const orders = new OrderService();

/** GET /api/orders — order history */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "orders:list");
    const user = await requireBuyerContext();
    const list = await orders.list(user.id);
    return ok({ orders: list });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/orders — checkout / create order */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "orders:create");
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as {
      addressId?: string;
      shippingAddress?: {
        fullName: string;
        phone?: string | null;
        line1: string;
        line2?: string | null;
        city: string;
        state: string;
        postalCode: string;
        country?: string;
      };
    };
    const order = await orders.checkout(user.id, body);
    return ok({ order }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
