import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError, NotFoundError } from "@/server/errors";

export const runtime = "nodejs";

/** POST /api/coupons/validate - Validate promotional discount code */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const code = String(body.code || "").trim().toUpperCase();
    const cartSubtotalRupees = Number(body.cartSubtotal || 0);

    if (!code) throw new ValidationError("Coupon code is required");
    if (cartSubtotalRupees <= 0) throw new ValidationError("Cart subtotal must be greater than zero");

    const cartSubtotalPaise = cartSubtotalRupees * 100;

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundError("Invalid or inactive promo coupon code");
    }

    // 1. Expiry check
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new ValidationError(`Coupon code ${code} has expired.`);
    }

    // 2. Usage limit check
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw new ValidationError(`Coupon code ${code} maximum usage limit reached.`);
    }

    // 3. Minimum Order Value check
    if (coupon.minOrderValue > 0 && cartSubtotalPaise < coupon.minOrderValue) {
      const minRupees = coupon.minOrderValue / 100;
      throw new ValidationError(
        `Coupon ${code} requires a minimum cart total of ₹${minRupees.toLocaleString("en-IN")}.`
      );
    }

    // 4. Calculate Discount Amount
    let discountPaise = 0;
    if (coupon.type === "percentage") {
      discountPaise = Math.round(cartSubtotalPaise * (coupon.value / 100));
      if (coupon.maxDiscount != null && coupon.maxDiscount > 0) {
        discountPaise = Math.min(discountPaise, coupon.maxDiscount);
      }
    } else {
      discountPaise = coupon.value; // value in paise
    }

    // Ensure discount does not exceed cart subtotal
    discountPaise = Math.min(discountPaise, cartSubtotalPaise);
    const discountRupees = discountPaise / 100;
    const finalSubtotalRupees = Math.max(0, cartSubtotalRupees - discountRupees);

    return ok({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmountRupees: discountRupees,
        discountAmountPaise: discountPaise,
        finalSubtotalRupees,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
