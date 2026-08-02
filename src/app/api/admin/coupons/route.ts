import { prisma } from "@/server/db";
import { requireAdminContext } from "@/server/auth/admin-guard";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/** GET /api/admin/coupons - List all promo coupons */
export async function GET() {
  try {
    await requireAdminContext();

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return ok({ coupons });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/admin/coupons - Create a new promotional coupon code */
export async function POST(request: Request) {
  try {
    await requireAdminContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const code = String(body.code || "").trim().toUpperCase();
    const type = String(body.type || "fixed_amount") === "percentage" ? "percentage" : "fixed_amount";
    const rawValue = Number(body.value || 0);
    const minOrderRupees = Number(body.minOrderValue || 0);
    const maxDiscountRupees = body.maxDiscount ? Number(body.maxDiscount) : null;
    const usageLimit = body.usageLimit ? Number(body.usageLimit) : null;
    const expiresAtStr = body.expiresAt ? String(body.expiresAt) : null;

    if (!code) throw new ValidationError("Coupon code is required");
    if (rawValue <= 0) throw new ValidationError("Coupon value must be greater than zero");

    // Convert value to paise if fixed_amount
    const value = type === "fixed_amount" ? rawValue * 100 : rawValue;
    const minOrderValue = minOrderRupees * 100;
    const maxDiscount = maxDiscountRupees ? maxDiscountRupees * 100 : null;
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        minOrderValue,
        maxDiscount,
        usageLimit,
        expiresAt,
        isActive: true,
      },
    });

    return ok({ coupon });
  } catch (error) {
    return fail(error);
  }
}
