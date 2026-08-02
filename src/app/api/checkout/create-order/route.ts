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
    const discountAppliedPaise = 10000;
    const finalAmountInPaise = Math.max(0, totalCartSubtotalPaise - discountAppliedPaise);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId = `order_rzp_mock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    if (keyId && keySecret && !keyId.startsWith("rzp_test_mock")) {
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
          }),
        });
        const data = await res.json();
        if (res.ok && data?.id) {
          razorpayOrderId = data.id as string;
        }
      } catch {
        /* fallback mock order ID */
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
      keyId: keyId || "rzp_test_mock",
      amount: finalAmountInPaise,
      currency: "INR",
      discountApplied: discountAppliedPaise,
      subOrdersCount: subOrders.length,
      cartTotalSubtotal: totalCartSubtotalRupees,
    });
  } catch (error) {
    return fail(error);
  }
}
