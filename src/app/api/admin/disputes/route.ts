import { prisma } from "@/server/db";
import { requireAdminContext } from "@/server/auth/admin-guard";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** GET /api/admin/disputes - List all Buyer Disputes for Admin Review */
export async function GET() {
  try {
    await requireAdminContext();

    const disputes = await prisma.orderDispute.findMany({
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            designer: { select: { id: true, name: true, handle: true } },
            items: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ disputes });
  } catch (error) {
    return fail(error);
  }
}
