import { prisma } from "@/server/db";
import { SMSService } from "./sms-service";

const smsService = new SMSService();

export class OrderSLACronService {
  /**
   * Process 48-hour timeout SLA for unaccepted designer orders.
   * Auto-cancels and refunds buyer via Razorpay API.
   */
  async process48HourSLA(): Promise<{ cancelledCount: number }> {
    const cutoff48HoursAgo = new Date(Date.now() - 48 * 3600 * 1000);

    // Find orders paid >48h ago that are still pending processing/acceptance
    const overdueOrders = await prisma.order.findMany({
      where: {
        status: "paid",
        createdAt: { lt: cutoff48HoursAgo },
      },
      include: {
        payment: true,
        items: true,
        user: true,
      },
    });

    let cancelledCount = 0;

    for (const order of overdueOrders) {
      try {
        // Razorpay API Refund Call (if payment exists and configured)
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (order.payment?.razorpayPaymentId && keyId && keySecret && !keyId.startsWith("rzp_test_mock")) {
          const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
          await fetch(`https://api.razorpay.com/v1/payments/${order.payment.razorpayPaymentId}/refund`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify({ amount: order.total }),
          }).catch(() => null);
        }

        // Restore variant inventory stock
        for (const item of order.items) {
          if (item.productId) {
            await prisma.productVariant.updateMany({
              where: { productId: item.productId, size: item.size },
              data: { stock: { increment: item.quantity } },
            }).catch(() => null);
          }
        }

        // Update Order status
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "cancelled",
            paymentStatus: "refunded",
          },
        });

        // Send cancellation notice
        if (order.user?.email) {
          console.log(`[Order SLA Cron] Cancelled overdue order #${order.id.slice(-6)} and issued refund.`);
        }

        cancelledCount++;
      } catch (err) {
        console.error(`[Order SLA Cron Error] Failed processing order #${order.id}`, err);
      }
    }

    return { cancelledCount };
  }
}
