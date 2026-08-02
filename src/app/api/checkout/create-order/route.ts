import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { createId } from "@/server/utils/ids";

export const runtime = "nodejs";

/** POST /api/checkout/create-order - Multi-Vendor Order & Razorpay Creation */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "checkout:create-order");
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const destinationPincode = String(body.pincode || "110001").trim();
    const itemsInput = Array.isArray(body.items) ? body.items : [];
    const shippingAddressInput = body.shippingAddress || null;
    const couponCode = typeof body.couponCode === "string" ? body.couponCode.trim().toUpperCase() : null;

    if (itemsInput.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    // Group items by designer house & validate
    const groupedItems: Record<
      string,
      Array<{
        product: any;
        quantity: number;
        size: string;
      }>
    > = {};

    let totalCartSubtotalRupees = 0;

    for (const item of itemsInput) {
      const productId = String(item.productId || "").trim();
      const quantity = Math.max(1, Number(item.quantity || 1));
      const size = String(item.size || "M").trim();

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new ValidationError(`Product ${productId} not found`);
      }

      if ((product as any).listingType === "CONCEPT_ART") {
        throw new ValidationError(`"${product.name}" is a Concept Art prototype item and cannot be purchased directly.`);
      }

      // Check stock availability
      if (product.piecesRemaining != null && product.piecesRemaining < quantity) {
        throw new ValidationError(`Insufficient stock for "${product.name}" (only ${product.piecesRemaining} remaining)`);
      }

      if (!groupedItems[product.designerId]) {
        groupedItems[product.designerId] = [];
      }

      groupedItems[product.designerId].push({
        product,
        quantity,
        size,
      });

      totalCartSubtotalRupees += product.price * quantity;
    }

    const totalCartSubtotalPaise = totalCartSubtotalRupees * 100;

    // -₹100 Instant Online Prepaid Discount (10,000 paise)
    const prepaidDiscountPaise = 10000;

    // Optional coupon discount
    let couponDiscountPaise = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: couponCode, isActive: true },
      });
      if (coupon) {
        couponDiscountPaise = (coupon as any).discountAmountRupees
          ? (coupon as any).discountAmountRupees * 100
          : 0;
      }
    }

    const discountAppliedPaise = prepaidDiscountPaise + couponDiscountPaise;
    const finalAmountInPaise = Math.max(5000, totalCartSubtotalPaise - discountAppliedPaise); // minimum ₹50 (5000 paise) for Razorpay

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const isRealKey = keyId && keySecret && !keyId.startsWith("rzp_test_mock");

    let razorpayOrderId = `order_rzp_mock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    let razorpayError: string | null = null;

    if (isRealKey) {
      try {
        const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: finalAmountInPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
              user_id: user.id,
              coupon: couponCode || "none",
            },
          }),
        });
        const data = await res.json();
        if (res.ok && data?.id) {
          razorpayOrderId = data.id as string;
        } else {
          // Surface the actual Razorpay error
          razorpayError = data?.error?.description || data?.message || `Razorpay API error ${res.status}`;
          console.error("[Checkout] Razorpay order creation failed:", data);
          throw new ValidationError(`Payment gateway error: ${razorpayError}`);
        }
      } catch (err) {
        if (err instanceof ValidationError) throw err;
        throw new ValidationError("Could not connect to payment gateway. Please try again.");
      }
    }

    // Persist Payment record
    const payment = await prisma.payment.create({
      data: {
        razorpayOrderId,
        amount: finalAmountInPaise,
        discountApplied: discountAppliedPaise,
        currency: "INR",
        status: "created",
      },
    });

    // Create N Sub-Orders (1 per Designer House)
    const subOrders = [];
    for (const [designerId, designerItems] of Object.entries(groupedItems)) {
      let designerSubtotalRupees = 0;
      let designerBasePriceRupees = 0;
      let designerShippingFeeRupees = 0;

      const orderItemsToCreate = [];

      for (const { product, quantity, size } of designerItems) {
        const itemSubtotal = product.price * quantity;
        designerSubtotalRupees += itemSubtotal;
        designerBasePriceRupees += (product.basePrice ?? product.price) * quantity;

        const weight = (product as any).weightGrams || 800;
        let shipFee = 150;
        if (weight <= 500) shipFee = 100;
        else if (weight <= 1000) shipFee = 150;
        else if (weight <= 3000) shipFee = 250;
        else shipFee = 400;

        designerShippingFeeRupees += shipFee * quantity;

        orderItemsToCreate.push({
          productId: product.id,
          name: product.name,
          brand: product.designerName,
          price: product.price,
          size,
          image: product.images[0] || "",
          quantity,
        });
      }

      const orderId = createId("ord");
      const subOrder = await prisma.order.create({
        data: {
          id: orderId,
          userId: user.id,
          parentPaymentId: payment.id,
          designerId,
          status: "pending",
          subtotal: designerSubtotalRupees * 100, // in paise
          baseGarmentPrice: designerBasePriceRupees * 100, // in paise
          builtInShippingFee: designerShippingFeeRupees * 100, // in paise
          shippingFee: 0, // Free shipping banner
          total: designerSubtotalRupees * 100,
          currency: "INR",
          shippingAddress: shippingAddressInput || { destinationPincode },
          paymentStatus: "pending",
          items: {
            create: orderItemsToCreate,
          },
        },
      });

      subOrders.push(subOrder);
    }

    return ok({
      razorpayOrderId,
      paymentId: payment.id,
      // Always return the real key (test or live) so the client can open real Razorpay checkout
      keyId: keyId || "rzp_test_mock",
      amount: finalAmountInPaise,
      currency: "INR",
      discountApplied: discountAppliedPaise,
      subOrdersCount: subOrders.length,
      cartTotalSubtotal: totalCartSubtotalRupees,
      isMockPayment: !isRealKey,
    });
  } catch (error) {
    return fail(error);
  }
}
