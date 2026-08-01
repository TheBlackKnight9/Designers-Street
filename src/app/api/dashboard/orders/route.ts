import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { OrderService } from "@/server/services/order-service";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import type { OrderStatus } from "@prisma/client";

export const runtime = "nodejs";

const orders = new OrderService();

/** GET /api/dashboard/orders — list orders for authenticated designer */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "dashboard:orders:list");
    const ctx = await requireDashboardContext();
    const list = await orders.listByDesigner(ctx.designer.name);
    return ok({ orders: list });
  } catch (error) {
    return fail(error);
  }
}

/** PATCH /api/dashboard/orders — update order timeline status */
export async function PATCH(request: Request) {
  try {
    enforcePublicRateLimit(request, "dashboard:orders:update");
    const ctx = await requireDashboardContext();
    const body = (await request.json().catch(() => ({}))) as {
      orderId?: string;
      status?: OrderStatus;
      note?: string;
    };
    if (!body.orderId || !body.status) {
      return fail(new Error("orderId and status are required"));
    }
    const updated = await orders.updateStatusByDesigner(
      body.orderId,
      ctx.designer.name,
      body.status,
      body.note
    );
    return ok({ order: updated });
  } catch (error) {
    return fail(error);
  }
}
