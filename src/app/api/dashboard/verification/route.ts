import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { prisma } from "@/server/db";
import { RazorpayRouteService } from "@/server/services/razorpay-route";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";
const razorpayRoute = new RazorpayRouteService();

/** GET /api/dashboard/verification */
export async function GET(request: Request) {
  try {
    const ctx = await requireDashboardContext();
    const verification = await prisma.businessVerification.findUnique({
      where: { designerId: ctx.designer.id },
    });

    const house = await prisma.designerHouse.findUnique({
      where: { id: ctx.designer.id },
      select: {
        razorpayAccountId: true,
        razorpayAccountStatus: true,
        listingsApproved: true,
      },
    });

    return ok({
      verification,
      razorpayAccountId: house?.razorpayAccountId || null,
      razorpayAccountStatus: house?.razorpayAccountStatus || "pending",
      listingsApproved: Boolean(house?.listingsApproved),
    });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/dashboard/verification */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "dashboard:verification");
    const ctx = await requireDashboardContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const businessType = String(body.businessType || "Proprietorship").trim();
    const gstin = typeof body.gstin === "string" ? body.gstin.trim().toUpperCase() : null;
    const panNumber = String(body.panNumber || "").trim().toUpperCase();
    const bankAccountName = String(body.bankAccountName || "").trim();
    const bankAccountNumber = String(body.bankAccountNumber || "").trim();
    const bankIfsc = String(body.bankIfsc || "").trim().toUpperCase();
    const cancelledChequeUrl = typeof body.cancelledChequeUrl === "string" ? body.cancelledChequeUrl.trim() : null;
    const shippingPincode = String(body.shippingPincode || "").trim();
    const shippingCity = String(body.shippingCity || "").trim();
    const shippingState = String(body.shippingState || "").trim();
    const shippingAddress = String(body.shippingAddress || "").trim();

    // Validation Regexes
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (!panNumber || !panRegex.test(panNumber)) {
      throw new ValidationError("Valid 10-character PAN number is required (e.g. ABCDE1234F)");
    }
    if (gstin && !gstinRegex.test(gstin)) {
      throw new ValidationError("Invalid 15-character GSTIN format (e.g. 22AAAAA0000A1Z5)");
    }
    if (!bankAccountName) throw new ValidationError("Beneficiary account name is required");
    if (!bankAccountNumber || bankAccountNumber.length < 8) {
      throw new ValidationError("Valid bank account number is required");
    }
    if (!bankIfsc || !ifscRegex.test(bankIfsc)) {
      throw new ValidationError("Valid 11-character IFSC code is required (e.g. HDFC0001234)");
    }
    if (!shippingPincode || shippingPincode.length !== 6) {
      throw new ValidationError("Valid 6-digit shipping pincode is required");
    }
    if (!shippingCity || !shippingState || !shippingAddress) {
      throw new ValidationError("Complete shipping origin address is required");
    }

    const verification = await prisma.businessVerification.upsert({
      where: { designerId: ctx.designer.id },
      create: {
        designerId: ctx.designer.id,
        businessType,
        gstin,
        panNumber,
        bankAccountName,
        bankAccountNumber,
        bankIfsc,
        cancelledChequeUrl,
        shippingPincode,
        shippingCity,
        shippingState,
        shippingAddress,
        isGstVerified: Boolean(gstin),
        isBankVerified: true,
        verifiedAt: new Date(),
      },
      update: {
        businessType,
        gstin,
        panNumber,
        bankAccountName,
        bankAccountNumber,
        bankIfsc,
        cancelledChequeUrl,
        shippingPincode,
        shippingCity,
        shippingState,
        shippingAddress,
        isGstVerified: Boolean(gstin),
        isBankVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Trigger Razorpay Route Account Setup
    const routeResult = await razorpayRoute.registerLinkedAccount({
      designerId: ctx.designer.id,
      businessType,
      panNumber,
      gstin,
      bankAccountName,
      bankAccountNumber,
      bankIfsc,
      shippingPincode,
      shippingCity,
      shippingState,
    });

    return ok({
      verification,
      razorpayAccountId: routeResult.accountId,
      razorpayAccountStatus: routeResult.accountStatus,
    });
  } catch (error) {
    return fail(error);
  }
}
