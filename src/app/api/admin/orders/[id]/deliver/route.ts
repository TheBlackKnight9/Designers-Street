import { prisma } from "@/server/db";
import { requireAdminContext } from "@/server/auth/admin-guard";
import { ok, fail } from "@/server/utils/api-response";
import { NotFoundError } from "@/server/errors";
import { SMSService } from "@/server/services/sms-service";

export const runtime = "nodejs";
const smsService = new SMSService();

/** POST /api/admin/orders/[id]/deliver - Mark Order as Delivered */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminContext();
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) throw new NotFoundError("Order not found");

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "delivered",
        deliveredAt: new Date(),
      },
    });

    // Trigger SMS Notification safely
    if (order.user) {
      const userPhone = (order.shippingAddress as any)?.phone || "9999999999";
      await smsService.sendOrderNotification("ORDER_DELIVERED", {
        mobileNumber: userPhone,
        orderId: order.id,
        customerName: order.user.name || "Customer",
        trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://designersstreet.com"}/orders/${order.id}`,
        totalAmount: order.total / 100,
      });
    }

    return ok({ order: updatedOrder });
  } catch (error) {
    return fail(error);
  }
}
