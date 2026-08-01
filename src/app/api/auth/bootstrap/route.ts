import { createClient } from "@/lib/supabase/server";
import { ensureDesignerAccount } from "@/server/auth/dashboard-session";
import { ensureBuyerAccount } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/**
 * POST /api/auth/bootstrap
 * Sync Prisma user after Supabase signup/login.
 * body.intent: "buyer" | "designer" (default designer for backward compat)
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      houseName?: string;
      handle?: string;
      name?: string;
      intent?: "buyer" | "designer";
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      throw new ValidationError("Not authenticated with Supabase");
    }

    const name =
      body.name ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      null;

    const intent = body.intent === "buyer" ? "buyer" : "designer";

    if (intent === "buyer") {
      const sessionUser = await ensureBuyerAccount({
        authUserId: user.id,
        email: user.email,
        name,
      });
      return ok({ user: sessionUser, designer: null });
    }

    const ctx = await ensureDesignerAccount({
      authUserId: user.id,
      email: user.email,
      name,
      houseName: body.houseName ?? null,
      handle: body.handle ?? null,
      // Only designer signup (house/handle) may promote an existing buyer.
      promoteBuyer: Boolean(body.houseName || body.handle),
    });

    return ok({
      user: ctx.user,
      designer: {
        id: ctx.designer.id,
        name: ctx.designer.name,
        handle: ctx.designer.handle,
        logo: ctx.designer.logo,
        banner: ctx.designer.banner,
        bio: ctx.designer.bio,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
