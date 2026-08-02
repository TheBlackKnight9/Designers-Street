import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** POST /api/webhooks/razorpay - Razorpay Webhook Handler */
export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

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

      // 1. Upsert Payment Record
      const payment = await prisma.payment.upsert({
        where: { razorpayOrderId },
        create: {
          razorpayOrderId,
          razorpayPaymentId,
          amount: paymentEntity.amount,
          currency: paymentEntity.currency || "INR",
          status: "captured",
          method,
          discountApplied: 10000,
        },
        update: {
          razorpayPaymentId,
          status: "captured",
          method,
        },
      });

      // 2. Fetch linked designer sub-orders
      const orders = await prisma.order.findMany({
        where: { parentPaymentId: payment.id },
        include: { items: true },
      });

      const totalCartSubtotal = orders.reduce((sum, ord) => sum + ord.subtotal, 0) || 1;
      const discountApplied = payment.discountApplied || 10000;
      const hold7Days = new Date(Date.now() + 7 * 24 * 3600 * 1000);

      for (const order of orders) {
        // Pro-rata discount share calculation
        const discountShare = Math.round((order.subtotal / totalCartSubtotal) * discountApplied);

        let baseGarmentPriceTotal = 0;
        let builtInShippingTotal = 0;

        for (const item of order.items) {
          if (item.productId) {
            const prod = await prisma.product.findUnique({ where: { id: item.productId } });
            if (prod) {
              const basePrice = prod.basePrice ?? prod.price;
              baseGarmentPriceTotal += (basePrice * 100) * item.quantity;

              const weight = (prod as any).weightGrams || 800;
              let shipFee = 150;
              if (weight <= 500) shipFee = 100;
              else if (weight <= 1000) shipFee = 150;
              else if (weight <= 3000) shipFee = 250;
              else shipFee = 400;

              builtInShippingTotal += (shipFee * 100) * item.quantity;
            }
          }
        }

        if (baseGarmentPriceTotal === 0) {
          baseGarmentPriceTotal = order.subtotal;
        }

        const platformCommission = Math.round(baseGarmentPriceTotal * 0.10); // 10%
        const gstAmount = Math.round(baseGarmentPriceTotal * 0.12); // 12%
        const tcsDeducted = Math.round(baseGarmentPriceTotal * 0.01); // 1% Sec 52 TCS

        const designerNetPayable = Math.max(
          0,
          baseGarmentPriceTotal + builtInShippingTotal - platformCommission - tcsDeducted - discountShare
        );

        // Update Sub-Order Accounting & Status
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "paid",
            paymentStatus: "paid",
            baseGarmentPrice: baseGarmentPriceTotal,
            builtInShippingFee: builtInShippingTotal,
            platformCommission,
            gstAmount,
            prepaidDiscountShare: discountShare,
            tcsDeducted,
            designerNetPayable,
            transferOnHoldUntil: hold7Days,
          },
        });

        // Decrement Variant & Product Stock
        for (const item of order.items) {
          if (item.productId) {
            const prod = await prisma.product.findUnique({ where: { id: item.productId } });
            if (prod) {
              if (prod.piecesRemaining != null) {
                await prisma.product.update({
                  where: { id: prod.id },
                  data: {
                    piecesRemaining: Math.max(0, prod.piecesRemaining - item.quantity),
                    recentPurchaseCount: { increment: item.quantity },
                  },
                });
              }

              const variant = await prisma.productVariant.findFirst({
                where: { productId: prod.id, size: item.size },
              });
              if (variant) {
                const newStock = Math.max(0, variant.stock - item.quantity);
                await prisma.productVariant.update({
                  where: { id: variant.id },
                  data: {
                    stock: newStock,
                    isActive: newStock > 0,
                  },
                });
              }
            }
          }
        }
      }
    }

    return ok({ received: true });
  } catch (error) {
    return fail(error);
  }
}
