import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/server/db";
import { RazorpayRouteService } from "@/server/services/razorpay-route";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** POST /api/webhooks/razorpay */
export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    // Signature verification (if secret configured)
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(bodyText)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(bodyText || "{}");
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (event === "payment.captured" && paymentEntity) {
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      const method = paymentEntity.method || "card";

      // Update Payment record
      const payment = await prisma.payment.upsert({
        where: { razorpayOrderId },
        create: {
          razorpayOrderId,
          razorpayPaymentId,
          amount: paymentEntity.amount,
          currency: paymentEntity.currency || "INR",
          status: "captured",
          method,
        },
        update: {
          razorpayPaymentId,
          status: "captured",
          method,
        },
      });

      // Find sub-orders linked to this payment and trigger Razorpay Route transfers
      const orders = await prisma.order.findMany({
        where: { parentPaymentId: payment.id },
        include: { designer: true },
      });

      const hold7DaysTimestamp = new Date(Date.now() + 7 * 24 * 3600 * 1000);

      for (const order of orders) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "paid",
            paymentStatus: "paid",
            transferOnHoldUntil: hold7DaysTimestamp,
          },
        });
      }
    }

    return ok({ received: true });
  } catch (error) {
    return fail(error);
  }
}
