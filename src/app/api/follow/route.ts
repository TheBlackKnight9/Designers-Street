import { prisma } from "@/server/db";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/** GET /api/follow - List followed designer houses for buyer */
export async function GET() {
  try {
    const user = await requireBuyerContext();

    const follows = await prisma.follow.findMany({
      where: { followerUserId: user.id },
      include: {
        designer: {
          include: {
            posts: { take: 3, orderBy: { createdAt: "desc" } },
            products: { take: 4, orderBy: { createdAt: "desc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const followedIds = follows.map((f) => f.designerId);
    const houses = follows.map((f) => f.designer);

    return ok({ followedIds, houses, follows });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/follow - Toggle follow/unfollow for a Designer House */
export async function POST(request: Request) {
  try {
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const designerId = String(body.designerId || "").trim();

    if (!designerId) throw new ValidationError("designerId is required");

    const existing = await prisma.follow.findUnique({
      where: {
        followerUserId_designerId: {
          followerUserId: user.id,
          designerId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({
        where: { id: existing.id },
      });
      return ok({ followed: false, designerId });
    }

    await prisma.follow.create({
      data: {
        followerUserId: user.id,
        designerId,
      },
    });

    return ok({ followed: true, designerId });
  } catch (error) {
    return fail(error);
  }
}
