import { prisma } from "@/server/db";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError, NotFoundError, ForbiddenError } from "@/server/errors";

export const runtime = "nodejs";

/** POST /api/orders/[id]/dispute - Buyer "Report Not Received" Dispute Protection */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireBuyerContext();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const buyerReason = String(body.buyerReason || "Item Not Received").trim();
    const description = String(body.description || "").trim();

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) throw new NotFoundError("Order not found");
    if (order.userId !== user.id) {
      throw new ForbiddenError("Access denied");
    }

    // Freeze payout calculations by marking status as disputed and resetting hold date
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "disputed",
        transferOnHoldUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000), // Hold frozen for 1 year until resolved
      },
    });

    const dispute = await prisma.orderDispute.create({
      data: {
        orderId: id,
        buyerReason,
        description: description || "Buyer reported order not received after shipment.",
        status: "open",
      },
    });

    return ok({ order: updatedOrder, dispute });
  } catch (error) {
    return fail(error);
  }
}
