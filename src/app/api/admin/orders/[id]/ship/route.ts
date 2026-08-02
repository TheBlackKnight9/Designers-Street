import { prisma } from "@/server/db";
import { requireAdminContext } from "@/server/auth/admin-guard";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError, NotFoundError } from "@/server/errors";
import { SMSService } from "@/server/services/sms-service";

export const runtime = "nodejs";
const smsService = new SMSService();

/** POST /api/admin/orders/[id]/ship - Mark Order as Shipped */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminContext();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const courierName = String(body.courierName || "Delhivery").trim();
    const trackingNumber = String(body.trackingNumber || "").trim();
    const trackingUrl = String(body.trackingUrl || "").trim();

    if (!trackingNumber) {
      throw new ValidationError("Tracking Number is required");
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) throw new NotFoundError("Order not found");

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "shipped",
        shippedAt: new Date(),
        courierName,
        trackingNumber,
        trackingUrl: trackingUrl || `https://track.courier.in/${trackingNumber}`,
      },
    });

    // Trigger SMS Notification safely
    if (order.user) {
      const userPhone = (order.shippingAddress as any)?.phone || "9999999999";
      await smsService.sendOrderNotification("ORDER_SHIPPED", {
        mobileNumber: userPhone,
        orderId: order.id,
        customerName: order.user.name || "Customer",
        courierName,
        trackingNumber,
        trackingUrl: updatedOrder.trackingUrl || "",
        totalAmount: order.total / 100,
      });
    }

    return ok({ order: updatedOrder });
  } catch (error) {
    return fail(error);
  }
}
