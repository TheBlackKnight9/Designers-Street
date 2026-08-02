import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/** GET /api/concept-interest - Admin List All Concept Prototype Inquiry Leads */
export async function GET() {
  try {
    const leads = await prisma.conceptInterest.findMany({
      include: {
        product: {
          select: { id: true, name: true, designerName: true, images: true, category: true },
        },
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

    const productId = String(body.productId || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const budgetRange = String(body.budgetRange || "₹50,000 - ₹1,50,000").trim();
    const notes = String(body.notes || "").trim();

    if (!productId) throw new ValidationError("productId is required");
    if (!name) throw new ValidationError("Full name is required");
    if (!email) throw new ValidationError("Email address is required");

    const lead = await prisma.conceptInterest.create({
      data: {
        productId,
        name,
        email,
        phone,
        budgetRange,
        notes,
        status: "new",
      },
    });

    return ok({ lead });
  } catch (error) {
    return fail(error);
  }
}
