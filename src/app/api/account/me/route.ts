import { prisma } from "@/server/db";
import { getOptionalAuthUser, requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { optionalString } from "@/server/utils/validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** GET /api/account/me — buyer/session profile (does not promote to designer) */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "account:me");
    const user = await getOptionalAuthUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not signed in" } },
        { status: 401 }
      );
    }
    const followingCount = await prisma.follow.count({
      where: { followerUserId: user.id },
    });
    return ok({ user, followingCount });
  } catch (error) {
    return fail(error);
  }
}

/** PATCH /api/account/me — update name / avatarUrl */
export async function PATCH(request: Request) {
  try {
    enforcePublicRateLimit(request, "account:me");
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const name = optionalString(body.name);
    const avatarUrl = optionalString(body.avatarUrl ?? body.avatar_url);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
    });

    return ok({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
