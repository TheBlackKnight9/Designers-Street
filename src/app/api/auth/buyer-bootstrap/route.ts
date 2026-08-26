import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserService } from "@/server/services/user-service";
import { ok, fail } from "@/server/utils/api-response";
import { isDatabaseEnabled } from "@/server/utils/env";

export const runtime = "nodejs";
const users = new UserService();

/**
 * POST /api/auth/buyer-bootstrap
 * Verifies Supabase session and ensures a corresponding User record exists in Prisma with role = "buyer".
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    // Guest users are not signed in — return clean 200 unbootstrapped response instead of throwing HTTP 500
    if (!authUser?.email) {
      return ok({ bootstrapped: false, user: null, message: "Not signed in" });
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

    if (!isDatabaseEnabled()) {
      return ok({
        bootstrapped: true,
        user: {
          id: authUser.id,
          email: authUser.email,
          name: name || metaName || authUser.email,
          role: (authUser.user_metadata?.role as string) || "buyer",
          avatarUrl: metaAvatar,
        },
      });
    }

    try {
      let user = await users.getById(authUser.id).catch(() => null);

      if (!user) {
        const byEmail = await users.findByEmail(authUser.email);
        if (byEmail && byEmail.id !== authUser.id) {
          return ok({ bootstrapped: false, user: null, message: "Account email collision" });
        }
        user = await users.createWithId({
          id: authUser.id,
          email: authUser.email,
          name: name || metaName,
          role: (authUser.user_metadata?.role as any) || "buyer",
          avatarUrl: metaAvatar,
        });
      } else if (metaAvatar && !user.avatarUrl) {
        user = await users.updateAccountProfile(authUser.id, { avatarUrl: metaAvatar });
      }

      return ok({
        bootstrapped: true,
        user,
      });
    } catch (dbErr) {
      console.error("[buyer-bootstrap] DB error, serving fallback user:", dbErr);
      return ok({
        bootstrapped: true,
        user: {
          id: authUser.id,
          email: authUser.email,
          name: name || metaName || authUser.email,
          role: (authUser.user_metadata?.role as string) || "buyer",
          avatarUrl: metaAvatar,
        },
      });
    }
  } catch (error) {
    return fail(error);
  }
}
