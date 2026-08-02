import { prisma } from "@/server/db";
import { requireAdminContext } from "@/server/auth/admin-guard";
import { ok, fail } from "@/server/utils/api-response";
import { NotFoundError, ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/** POST /api/admin/disputes/[id]/resolve - Admin Dispute Resolution & Payout Unfreeze/Refund */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCtx = await requireAdminContext();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const resolution = String(body.resolution || "delivered_confirmed").trim();
    const adminNotes = String(body.adminNotes || "").trim();

    if (resolution !== "delivered_confirmed" && resolution !== "refunded") {
      throw new ValidationError("Resolution must be 'delivered_confirmed' or 'refunded'");
    }

    const dispute = await prisma.orderDispute.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!dispute) throw new NotFoundError("Dispute not found");

    const updatedDispute = await prisma.orderDispute.update({
      where: { id },
      data: {
        status: "resolved",
        resolution,
        adminNotes,
        resolvedBy: adminCtx.user.id,
        resolvedAt: new Date(),
      },
    });

    if (resolution === "delivered_confirmed") {
      // Unfreeze payout hold & update order status to delivered
      await prisma.order.update({
        where: { id: dispute.orderId },
        data: {
          status: "delivered",
          deliveredAt: new Date(),
          transferOnHoldUntil: new Date(), // Immediate unfreeze for next payout ledger run
        },
      });
    } else {
      // Refund Buyer & Cancel Payout
      await prisma.order.update({
        where: { id: dispute.orderId },
        data: {
          status: "cancelled",
          paymentStatus: "refunded",
          designerNetEarnings: 0,
          designerNetPayable: 0,
        },
      });
    }

    return ok({ dispute: updatedDispute });
  } catch (error) {
    return fail(error);
  }
}
