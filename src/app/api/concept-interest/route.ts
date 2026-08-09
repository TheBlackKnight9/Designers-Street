import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/** GET /api/concept-interest - List Concept Prototype Inquiry Leads */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const context = searchParams.get("context");

    let designerIdFilter: string | undefined;

    if (context === "dashboard") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const adminActiveHouseId = cookieStore.get("admin_active_designer_id")?.value;
        if (adminActiveHouseId) {
          designerIdFilter = adminActiveHouseId;
        }
      } catch (err) {}
    }

    const whereClause = designerIdFilter ? {
      OR: [
        { product: { designerId: designerIdFilter } },
        { post: { designerId: designerIdFilter } }
      ]
    } : {};

    const leads = await prisma.conceptInterest.findMany({
      where: whereClause,
      include: {
        product: {
          select: { id: true, name: true, designerName: true, images: true, category: true },
        },
        post: {
          select: { id: true, caption: true, designerName: true, image: true, tag: true },
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ leads });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/concept-interest - Submit Bespoke Quote / Express Interest for CONCEPT_ART prototypes */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const sourceType = String(body.sourceType || "PRODUCT").trim();
    const productId = String(body.productId || "").trim();
    const postId = String(body.postId || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const budgetRange = String(body.budgetRange || "").trim();
    const notes = String(body.notes || "").trim();
    const intent = body.intent as string | undefined;
    const consultationDate = body.consultationDate ? new Date(body.consultationDate as string) : undefined;

    if (!productId && !postId) throw new ValidationError("productId or postId is required");
    if (!name) throw new ValidationError("Full name is required");
    if (!phone) throw new ValidationError("Phone number is required");

    const lead = await prisma.conceptInterest.create({
      data: {
        sourceType: sourceType as any,
        productId: productId || null,
        postId: postId || null,
        name,
        email: email || "no-email@example.com",
        phone,
        budgetRange,
        notes,
        intent: intent as any,
        consultationDate,
        status: "NEW",
      },
    });

    return ok({ lead });
  } catch (error) {
    return fail(error);
  }
}
