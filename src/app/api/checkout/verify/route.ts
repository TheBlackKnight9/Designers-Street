import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/server/db";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/** POST /api/checkout/verify - Verify Razorpay payment and perform Multi-Vendor accounting split */
export async function POST(request: Request) {
  try {
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const razorpayPaymentId = String(body.razorpayPaymentId || body.razorpay_payment_id || "").trim();
    const razorpayOrderId = String(body.razorpayOrderId || body.razorpay_order_id || "").trim();
    const razorpaySignature = String(body.razorpaySignature || body.razorpay_signature || "").trim();

    if (!razorpayOrderId) {
      throw new ValidationError("Razorpay Order ID is required");
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && razorpaySignature && !razorpayOrderId.startsWith("order_rzp_mock")) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        throw new ValidationError("Payment signature verification failed");
      }
    }

    // Find Payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: { orders: { include: { items: true } } },
    });

    if (!payment) {
      throw new ValidationError("Payment record not found");
    }

    // Mark payment captured
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
        status: "captured",
      },
    });

    // Calculate total cart subtotal across sub-orders
    const totalCartSubtotal = payment.orders.reduce((sum, ord) => sum + ord.subtotal, 0) || 1;
    const discountApplied = payment.discountApplied || 10000; // 10,000 paise = ₹100

    const hold7Days = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    const updatedOrders = [];

    for (const order of payment.orders) {
      // 1. Pro-Rata ₹100 Discount Split
      const discountShare = Math.round((order.subtotal / totalCartSubtotal) * discountApplied);

      // 2. Line-Item Financial Accounting Metrics
      let baseGarmentPriceTotal = 0;
      let builtInShippingTotal = 0;

      for (const item of order.items) {
        if (item.productId) {
          const prod = await prisma.product.findUnique({ where: { id: item.productId } });
          if (prod) {
            const basePrice = prod.basePrice ?? prod.price;
            baseGarmentPriceTotal += (basePrice * 100) * item.quantity; // in paise

            const weight = (prod as any).weightGrams || 800;
            let shipFeeRupees = 150;
            if (weight <= 500) shipFeeRupees = 100;
            else if (weight <= 1000) shipFeeRupees = 150;
            else if (weight <= 3000) shipFeeRupees = 250;
            else shipFeeRupees = 400;

            builtInShippingTotal += (shipFeeRupees * 100) * item.quantity; // in paise
          }
        }
      }

      if (baseGarmentPriceTotal === 0) {
        baseGarmentPriceTotal = order.subtotal;
      }

      const platformCommission = Math.round(baseGarmentPriceTotal * 0.10); // 10%
      const gstAmount = Math.round(baseGarmentPriceTotal * 0.12); // 12% GST
      const tcsDeducted = Math.round(baseGarmentPriceTotal * 0.01); // 1% Sec 52 TCS

      const designerNetPayable = Math.max(
        0,
        baseGarmentPriceTotal + builtInShippingTotal - platformCommission - tcsDeducted - discountShare
      );

      // Update Sub-Order Financial Record
      const updatedOrder = await prisma.order.update({
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

      // 3. Permanent Variant Stock Decrement
      for (const item of order.items) {
        if (item.productId) {
          const prod = await prisma.product.findUnique({ where: { id: item.productId } });
          if (prod) {
            // Decrement aggregate piecesRemaining
            if (prod.piecesRemaining != null) {
              await prisma.product.update({
                where: { id: prod.id },
                data: {
                  piecesRemaining: Math.max(0, prod.piecesRemaining - item.quantity),
                  recentPurchaseCount: { increment: item.quantity },
                },
              });
            }

            // Decrement specific variant stock if variant exists
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

      updatedOrders.push(updatedOrder);
    }

    // Clear buyer's server cart
    const userCart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (userCart) {
      await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
    }

    return ok({
      verified: true,
      paymentId: payment.id,
      ordersCount: updatedOrders.length,
      orders: updatedOrders,
    });
  } catch (error) {
    return fail(error);
  }
}
