import { prisma } from "@/server/db";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError, NotFoundError } from "@/server/errors";

export const runtime = "nodejs";

/** GET /api/reviews?productId=... - Fetch approved reviews for a product */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) throw new ValidationError("productId parameter is required");

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalCount = reviews.length;
    const avgRating = totalCount > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10
      : 5.0;

    return ok({ reviews, avgRating, totalCount });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/reviews - Submit a verified buyer product review */
export async function POST(request: Request) {
  try {
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const productId = String(body.productId || "").trim();
    const rating = Math.min(5, Math.max(1, Number(body.rating || 5)));
    const title = String(body.title || "").trim();
    const reviewBody = String(body.body || "").trim();
    const images = Array.isArray(body.images) ? (body.images as string[]) : [];

    if (!productId) throw new ValidationError("productId is required");
    if (!reviewBody) throw new ValidationError("Review body text is required");

    // Verified Buyer Check: Must have a delivered order containing this productId
    const matchingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: "delivered",
        items: {
          some: { productId },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const isVerified = Boolean(matchingOrder);
    const orderId = matchingOrder ? matchingOrder.id : (
      await prisma.order.findFirst({ where: { userId: user.id }, select: { id: true } })
    )?.id;

    if (!orderId) {
      throw new ValidationError("Only buyers with order records can post product reviews.");
    }

    const review = await prisma.review.upsert({
      where: {
        userId_productId_orderId: {
          userId: user.id,
          productId,
          orderId,
        },
      },
      create: {
        userId: user.id,
        productId,
        orderId,
        rating,
        title,
        body: reviewBody,
        images,
        isVerified,
        isApproved: true,
      },
      update: {
        rating,
        title,
        body: reviewBody,
        images,
        isVerified,
      },
    });

    return ok({ review });
  } catch (error) {
    return fail(error);
  }
}
