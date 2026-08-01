import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ShippingCalculatorService } from "@/server/services/shipping-calculator";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";
const shippingCalc = new ShippingCalculatorService();

/** POST /api/checkout/create-order */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "checkout:create-order");
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const destinationPincode = String(body.pincode || "110001").trim();
    const itemsInput = Array.isArray(body.items) ? body.items : [];

    if (itemsInput.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    const preparedItems = [];
    for (const item of itemsInput) {
      const product = await prisma.product.findUnique({
        where: { id: String(item.productId) },
      });

      if (!product) {
        throw new ValidationError(`Product ${item.productId} not found`);
      }

      if ((product as any).listingType === "CONCEPT_ART") {
        throw new ValidationError(`"${product.name}" is a Concept Art showcase item and cannot be purchased directly.`);
      }

      preparedItems.push({
        productId: product.id,
        designerId: product.designerId,
        price: product.price,
        quantity: Math.max(1, Number(item.quantity || 1)),
        weightGrams: (product as any).weightGrams || 500,
        name: product.name,
        designerName: product.designerName,
        image: product.images[0] || "",
        size: String(item.size || "M"),
      });
    }

    // Compute Multi-Vendor Financial Split
    const calculation = await shippingCalc.calculateMultiVendorSplit(preparedItems, destinationPincode);

    const totalAmountPaise = Math.round(calculation.grandTotal * 100);

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
            amount: totalAmountPaise,
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
        amount: totalAmountPaise,
        currency: "INR",
        status: "created",
      },
    });

    return ok({
      razorpayOrderId,
      paymentId: payment.id,
      keyId: keyId || "rzp_test_mock",
      amount: totalAmountPaise,
      currency: "INR",
      breakdown: calculation,
    });
  } catch (error) {
    return fail(error);
  }
}
