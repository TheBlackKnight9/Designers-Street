import { getOptionalAuthUser, requireBuyerContext } from "@/server/auth/buyer-session";
import { UserService } from "@/server/services/user-service";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { optionalString } from "@/server/utils/validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const users = new UserService();

/** GET /api/account/me — buyer/session profile (does not promote to designer) */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "account:me");
    const user = await getOptionalAuthUser();
    if (!user) {
      return ok({ user: null });
    }
    return ok(await users.getAccountSummary(user));
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

    const updated = await users.updateAccountProfile(user.id, {
      ...(name !== undefined ? { name } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
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
