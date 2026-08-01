import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { SMSService } from "@/server/services/sms-service";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError, NotFoundError, ForbiddenError } from "@/server/errors";

export const runtime = "nodejs";
const smsService = new SMSService();

/** POST /api/dashboard/orders/[id]/fulfill */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, designer } = await requireDashboardContext();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const action = String(body.action || "").toLowerCase(); // "accept" | "reject" | "ship" | "deliver"

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: true,
        designer: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Verify ownership
    if (user.role === "designer" && order.designerId !== designer.id) {
      throw new ForbiddenError("Not authorized to fulfill this order");
    }

    if (action === "accept") {
      const updated = await prisma.order.update({
        where: { id },
        data: { status: "processing" },
      });
      return ok({ order: updated });
    }

    if (action === "reject") {
      // Restore variant stock
      for (const item of order.items) {
        if (item.productId) {
          await prisma.productVariant.updateMany({
            where: { productId: item.productId, size: item.size },
            data: { stock: { increment: item.quantity } },
          }).catch(() => null);
        }
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { status: "cancelled", paymentStatus: "refunded" },
      });

      return ok({ order: updated, message: "Order rejected and stock restored." });
    }

    if (action === "ship") {
      const courierName = String(body.courierName || "Courier Partner").trim();
      const trackingNumber = String(body.trackingNumber || "").trim();
      const trackingUrl = String(body.trackingUrl || "").trim() || `https://www.google.com/search?q=${encodeURIComponent(courierName + " " + trackingNumber)}`;

      if (!trackingNumber) {
        throw new ValidationError("Tracking number is required");
      }

      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: "shipped",
          courierName,
          trackingNumber,
          trackingUrl,
          shippedAt: new Date(),
          expectedDelivery: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        },
      });

      // Trigger SMS notification safely
      const phone = (order.shippingAddress as any)?.phone || order.user?.email || "";
      if (phone) {
        await smsService.sendOrderNotification("ORDER_SHIPPED", {
          mobileNumber: phone,
          orderId: order.id,
          customerName: order.user?.name || "Customer",
          courierName,
          trackingNumber,
          trackingUrl,
        });
      }

      return ok({ order: updated });
    }

    if (action === "deliver") {
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: "delivered",
          deliveredAt: new Date(),
        },
      });

      const phone = (order.shippingAddress as any)?.phone || "";
      if (phone) {
        await smsService.sendOrderNotification("ORDER_DELIVERED", {
          mobileNumber: phone,
          orderId: order.id,
          customerName: order.user?.name || "Customer",
        });
      }

      return ok({ order: updated });
    }

    throw new ValidationError("Invalid action parameter");
  } catch (error) {
    return fail(error);
  }
}
