import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError, NotFoundError } from "@/server/errors";

export const runtime = "nodejs";

/** POST /api/orders/[id]/dispute */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireBuyerContext();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const buyerReason = String(body.buyerReason || "Non-delivery / Report Not Received").trim();
    const description = String(body.description || "").trim();

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Freeze Payout Hold & update status to disputed
    const [dispute, updatedOrder] = await prisma.$transaction([
      prisma.orderDispute.create({
        data: {
          orderId: order.id,
          buyerReason,
          description,
          status: "open",
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "disputed",
          transferOnHoldUntil: null, // Freeze payout release
        },
      }),
    ]);

    return ok({ dispute, order: updatedOrder, message: "Dispute opened. Payout hold frozen pending admin review." });
  } catch (error) {
    return fail(error);
  }
}
