import { createClient } from "@/lib/supabase/server";
import { ensureBuyerAccount } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/**
 * POST /api/auth/bootstrap
 * Sync Prisma user after Supabase signup/login.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      intent?: string;
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return ok({ bootstrapped: false, user: null, message: "Not authenticated with Supabase" });
    }

    const name =
      body.name ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      null;

    const sessionUser = await ensureBuyerAccount({
      authUserId: user.id,
      email: user.email,
      name,
    });

    return ok({ user: sessionUser, designer: null });
  } catch (error) {
    return fail(error);
  }
}
