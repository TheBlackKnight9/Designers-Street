import { CommentService } from "@/server/services/comment-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { parseLimit, requireString } from "@/server/utils/validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };
const comments = new CommentService();

/** GET /api/posts/[id]/comments */
export async function GET(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "comments:list");
    const { id } = await ctx.params;
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"), 20, 50);
    const cursor = searchParams.get("cursor");
    const parentId = searchParams.get("parentId");
    const page = await comments.list(id, {
      limit,
      cursor,
      parentId: parentId || null,
    });
    return ok(page);
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/posts/[id]/comments */
export async function POST(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "comments:mutate");
    const { id } = await ctx.params;
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as {
      body?: string;
      parentId?: string;
    };
    const text = requireString(body.body, "body");
    const result = await comments.create(user.id, {
      postId: id,
      body: text,
      parentId: body.parentId ?? null,
    });
    return ok(result, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
