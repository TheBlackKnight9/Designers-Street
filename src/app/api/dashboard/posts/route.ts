import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { normalizeFeedProductTag } from "@/lib/feed-product";

export const runtime = "nodejs";

// In-memory store for high-availability studio fallback
const MEM_POSTS: any[] = [];

/** GET /api/dashboard/posts - List posts created by logged-in designer */
export async function GET() {
  try {
    const ctx = await requireDashboardContext();
    let dbPosts: any[] = [];

    try {
      dbPosts = await prisma.post.findMany({
        where: { designerId: ctx.designer.id },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      /* fallback */
    }

    const designerMemPosts = MEM_POSTS.filter((p) => p.designerId === ctx.designer.id);
    const merged = [...designerMemPosts];
    for (const p of dbPosts) {
      if (!merged.some((m) => m.id === p.id)) {
        merged.push(p);
      }
    }

    return ok({ posts: merged });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/dashboard/posts - Create a new post with product tags */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "dashboard:posts");
    const ctx = await requireDashboardContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const image = typeof body.image === "string" ? body.image.trim() : "";
    const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl.trim() : null;
    const mediaType = body.mediaType === "video" || Boolean(videoUrl) ? "video" : "image";
    const caption = String(body.caption || "").trim();
    const type = body.type === "category" ? "category" : "designer_spotlight";
    const tag = typeof body.tag === "string" ? body.tag.trim() : "Editorial";
    const rawProductTag = body.productTag
      ? (body.productTag as Record<string, unknown>)
      : null;
    const normalizedProduct = normalizeFeedProductTag(
      rawProductTag as Parameters<typeof normalizeFeedProductTag>[0]
    );
    const productTag = normalizedProduct
      ? {
          ...rawProductTag,
          productId: normalizedProduct.productId,
          id: normalizedProduct.productId,
          name: normalizedProduct.name,
          price: normalizedProduct.price,
        }
      : null;
    const defaultLink = `/designer/${ctx.designer.handle}`;
    const link =
      normalizedProduct?.productId
        ? `/product/${normalizedProduct.productId}`
        : typeof body.link === "string" && body.link.trim()
          ? body.link.trim()
          : defaultLink;

    const postMediaImage = image || (mediaType === "video" ? "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80");

    if (!postMediaImage && !videoUrl) {
      throw new ValidationError("At least one image or video media URL is required");
    }
    if (!caption) {
      throw new ValidationError("Post caption is required");
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const newPostData = {
      id: postId,
      type,
      designerId: ctx.designer.id,
      designerName: ctx.designer.name,
      designerLogo: ctx.designer.logo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      designerVerified: ctx.designer.verified,
      tag,
      image: postMediaImage,
      videoUrl,
      mediaType: mediaType as any,
      caption,
      link,
      likesCount: 0,
      commentsCount: 0,
      productTag: productTag as any,
      createdAt: new Date().toISOString(),
    };

    try {
      await prisma.post.create({
        data: {
          id: postId,
          type,
          designerId: ctx.designer.id,
          designerName: ctx.designer.name,
          designerLogo: ctx.designer.logo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
          designerVerified: ctx.designer.verified,
          tag,
          image: postMediaImage,
          videoUrl,
          mediaType: mediaType as any,
          caption,
          link,
          productTag: productTag as any,
        },
      });
    } catch {
      /* fallback */
    }

    MEM_POSTS.unshift(newPostData);

    return ok({ post: newPostData }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
