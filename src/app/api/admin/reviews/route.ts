import { prisma } from "@/server/db";
import { requireAdminContext } from "@/server/auth/admin-guard";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** GET /api/admin/reviews - Admin Customer Reviews Moderation Desk */
export async function GET() {
  try {
    await requireAdminContext();

    const reviews = await prisma.review.findMany({
      include: {
        product: { select: { id: true, name: true, designerName: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ reviews });
  } catch (error) {
    return fail(error);
  }
}
