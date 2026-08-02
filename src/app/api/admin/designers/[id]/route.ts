import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { requireAdminApi } from "@/lib/auth/admin-guard";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/designers/[id] — Update house details */
export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdminApi();
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.designerHouse.findUnique({ where: { id } });
    if (!existing) throw new ValidationError("Designer house not found");

    const house = await prisma.designerHouse.update({
      where: { id },
      data: {
        ...(body.name && { name: String(body.name).trim() }),
        ...(body.bio !== undefined && { bio: String(body.bio).trim() }),
        ...(body.logo !== undefined && { logo: String(body.logo) }),
        ...(body.banner !== undefined && { banner: String(body.banner) }),
        ...(body.location !== undefined && { location: String(body.location) }),
        ...(body.accountStatus !== undefined && { accountStatus: body.accountStatus }),
        ...(body.verified !== undefined && { verified: Boolean(body.verified) }),
        ...(body.listingsApproved !== undefined && { listingsApproved: Boolean(body.listingsApproved) }),
        // Financials
        ...(body.commissionRate !== undefined && {
          commissionRate: parseFloat(String(body.commissionRate)),
        }),
        ...(body.gstin !== undefined && { gstin: body.gstin || null }),
        ...(body.pan !== undefined && { pan: body.pan || null }),
        ...(body.bankBeneficiary !== undefined && { bankBeneficiary: body.bankBeneficiary || null }),
        ...(body.bankAccount !== undefined && { bankAccount: body.bankAccount || null }),
        ...(body.bankIfsc !== undefined && { bankIfsc: body.bankIfsc || null }),
        ...(body.bankName !== undefined && { bankName: body.bankName || null }),
        // Shipping origin
        ...(body.shippingPincode !== undefined && { returnPincode: body.shippingPincode || null }),
        ...(body.shippingCity !== undefined && { returnCity: body.shippingCity || null }),
        ...(body.shippingState !== undefined && { returnState: body.shippingState || null }),
        ...(body.shippingAddress !== undefined && { returnAddressLine1: body.shippingAddress || null }),
      },
    });

    return ok({ house });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return new Response(JSON.stringify({ ok: false, error: { code: "FORBIDDEN" } }), { status: 403 });
    }
    return fail(error);
  }
}

/** DELETE /api/admin/designers/[id] — Soft-delete (suspend) a house */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAdminApi();
    const { id } = await params;

    await prisma.designerHouse.update({
      where: { id },
      data: { accountStatus: "suspended" },
    });

    return ok({ message: "Designer house suspended successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return new Response(JSON.stringify({ ok: false, error: { code: "FORBIDDEN" } }), { status: 403 });
    }
    return fail(error);
  }
}
