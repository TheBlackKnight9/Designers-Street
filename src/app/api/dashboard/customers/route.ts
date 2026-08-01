import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

/** GET /api/dashboard/customers — list buyers and followers for designer */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "dashboard:customers");
    const ctx = await requireDashboardContext();
    const designerId = ctx.designer.id;
    const designerName = ctx.designer.name;

    const [follows, orderItems] = await Promise.all([
      prisma.follow.findMany({
        where: { designerId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.orderItem.findMany({
        where: {
          brand: { equals: designerName, mode: "insensitive" },
        },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { order: { createdAt: "desc" } },
      }),
    ]);

    const followers = follows.map((f) => ({
      id: f.follower.id,
      name: f.follower.name || "Anonymous Follower",
      email: f.follower.email,
      avatarUrl: f.follower.avatarUrl,
      followedAt: f.createdAt,
    }));

    // Aggregate unique buyers
    const buyersMap = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string | null;
        totalOrders: number;
        lastOrderDate: Date;
      }
    >();

    for (const item of orderItems) {
      const u = item.order.user;
      if (!u) continue;
      const existing = buyersMap.get(u.id);
      if (existing) {
        existing.totalOrders += 1;
        if (item.order.createdAt > existing.lastOrderDate) {
          existing.lastOrderDate = item.order.createdAt;
        }
      } else {
        buyersMap.set(u.id, {
          id: u.id,
          name: u.name || "Valued Buyer",
          email: u.email,
          avatarUrl: u.avatarUrl,
          totalOrders: 1,
          lastOrderDate: item.order.createdAt,
        });
      }
    }

    return ok({
      followers,
      buyers: Array.from(buyersMap.values()),
    });
  } catch (error) {
    return fail(error);
  }
}
