import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { requireAdminApi } from "@/lib/auth/admin-guard";
import { ForbiddenError, ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/** GET /api/admin/designers — List all designer houses with stats */
export async function GET() {
  try {
    await requireAdminApi();

    const houses = await prisma.designerHouse.findMany({
      include: {
        _count: {
          select: { products: true, posts: true, orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ houses });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return new Response(JSON.stringify({ ok: false, error: { code: "FORBIDDEN", message: "Admin access required" } }), { status: 403 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return new Response(JSON.stringify({ ok: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }), { status: 401 });
    }
    return fail(error);
  }
}

/** POST /api/admin/designers — Create a new designer house */
export async function POST(request: Request) {
  try {
    await requireAdminApi();

    const body = await request.json();
    const name = String(body.name || "").trim();
    const rawHandle = String(body.handle || body.name || "").trim();
    const handle = rawHandle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    if (!name) throw new ValidationError("House name is required");
    if (!handle) throw new ValidationError("Handle is required");

    const existing = await prisma.designerHouse.findUnique({ where: { handle } });
    if (existing) throw new ValidationError(`Handle @${handle} is already taken`);

    const id = `dh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    const house = await prisma.designerHouse.create({
      data: {
        id,
        name,
        handle,
        bio: String(body.bio || "Luxury Designer House on Designer's Street").trim(),
        foundingStory: String(body.foundingStory || "Handcrafted haute couture & luxury fashion.").trim(),
        location: body.city && body.state
          ? `${body.city}, ${body.state}`
          : String(body.location || "India"),
        logo: String(body.logo || "https://images.unsplash.com/photo-1618220179428-22790b461013?w=200&q=80"),
        banner: String(body.banner || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"),
        signatureTechniques: Array.isArray(body.signatureTechniques)
          ? body.signatureTechniques
          : ["Haute Couture", "Zardozi"],
        verified: true,
        listingsApproved: true,
        accountStatus: "active",
        // Shipping origin
        returnAddressLine1: body.shippingAddress || null,
        returnCity: body.shippingCity || null,
        returnState: body.shippingState || null,
        returnPincode: body.shippingPincode || null,
        // Financial
        commissionRate: body.commissionRate ? parseFloat(String(body.commissionRate)) : 10,
        gstin: body.gstin || null,
        pan: body.pan || null,
        bankBeneficiary: body.bankBeneficiary || null,
        bankAccount: body.bankAccount || null,
        bankIfsc: body.bankIfsc || null,
        bankName: body.bankName || null,
      },
    });

    return ok({ house }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return new Response(JSON.stringify({ ok: false, error: { code: "FORBIDDEN", message: "Admin access required" } }), { status: 403 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return new Response(JSON.stringify({ ok: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }), { status: 401 });
    }
    return fail(error);
  }
}
