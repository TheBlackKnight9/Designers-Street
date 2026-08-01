import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

/** GET /api/dashboard/search?q=query — global search across products, orders, and customers */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "dashboard:search");
    const ctx = await requireDashboardContext();
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return ok({ products: [], orders: [], customers: [] });
    }

    const designerId = ctx.designer.id;
    const designerName = ctx.designer.name;

    const [products, orders, customers] = await Promise.all([
      prisma.product.findMany({
        where: {
          designerId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { tags: { has: query } },
          ],
        },
        take: 10,
        select: {
          id: true,
          name: true,
          price: true,
          status: true,
          images: true,
          piecesRemaining: true,
        },
      }),
      prisma.order.findMany({
        where: {
          items: {
            some: { brand: { equals: designerName, mode: "insensitive" } },
          },
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { status: { equals: query as any } },
          ],
        },
        take: 10,
        include: {
          items: true,
        },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      }),
    ]);

    return ok({ products, orders, customers });
  } catch (error) {
    return fail(error);
  }
}
