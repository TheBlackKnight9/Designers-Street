import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserService } from "@/server/services/user-service";
import { ok, fail } from "@/server/utils/api-response";
import { UnauthorizedError } from "@/server/errors";
import { isDatabaseEnabled } from "@/server/utils/env";

export const runtime = "nodejs";
const users = new UserService();

/**
 * POST /api/auth/buyer-bootstrap
 * Verifies Supabase session and ensures a corresponding User record exists in Prisma with role = "buyer".
 */
export async function POST(request: Request) {
  try {
    if (!isDatabaseEnabled()) {
      return ok({ bootstrapped: false, message: "Database mode disabled" });
    }

    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) {
      throw new UnauthorizedError("Not signed in");
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const metaName =
      (authUser.user_metadata?.full_name as string | undefined) ||
      (authUser.user_metadata?.name as string | undefined) ||
      null;
    const metaAvatar =
      (authUser.user_metadata?.avatar_url as string | undefined) ||
      (authUser.user_metadata?.picture as string | undefined) ||
      null;

    let user = await users.getById(authUser.id).catch(() => null);

    if (!user) {
      const byEmail = await users.findByEmail(authUser.email);
      if (byEmail && byEmail.id !== authUser.id) {
        throw new Error("An account with this email already exists with a different identity.");
      }
      user = await users.createWithId({
        id: authUser.id,
        email: authUser.email,
        name: name || metaName,
        role: "buyer",
        avatarUrl: metaAvatar,
      });
    } else if (metaAvatar && !user.avatarUrl) {
      user = await users.updateAccountProfile(authUser.id, { avatarUrl: metaAvatar });
    }

    return ok({
      bootstrapped: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
