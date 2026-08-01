import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

/** GET /api/dashboard/posts - List posts created by logged-in designer */
export async function GET() {
  try {
    const ctx = await requireDashboardContext();
    const posts = await prisma.post.findMany({
      where: { designerId: ctx.designer.id },
      orderBy: { createdAt: "desc" },
    });

    return ok({ posts });
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
    const link = typeof body.link === "string" ? body.link.trim() : `/designer/${ctx.designer.handle}`;
    const productTag = body.productTag ? body.productTag : null;

    const postMediaImage = image || (mediaType === "video" ? "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" : "");

    if (!postMediaImage && !videoUrl) {
      throw new ValidationError("At least one image or video media URL is required");
    }
    if (!caption) {
      throw new ValidationError("Post caption is required");
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const post = await prisma.post.create({
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

    return ok({ post }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
