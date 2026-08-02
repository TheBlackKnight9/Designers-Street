import { prisma } from "@/server/db";
import { requireAdminContext } from "@/server/auth/admin-guard";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** GET /api/admin/orders - Central Order Table for Admin Command Center */
export async function GET(request: Request) {
  try {
    await requireAdminContext();

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "all";

    let whereClause: any = {};
    if (statusFilter === "paid") whereClause.status = "paid";
    else if (statusFilter === "processing") whereClause.status = "processing";
    else if (statusFilter === "shipped") whereClause.status = "shipped";
    else if (statusFilter === "delivered") whereClause.status = "delivered";
    else if (statusFilter === "disputed") whereClause.status = "disputed";

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        designer: {
          select: { id: true, name: true, handle: true, logo: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        items: true,
        disputes: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ orders });
  } catch (error) {
    return fail(error);
  }
}
