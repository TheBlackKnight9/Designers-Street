import { createClient } from "@/lib/supabase/server";
import { ensureBuyerAccount } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/**
 * POST /api/auth/bootstrap
 * Sync Prisma user after Supabase signup/login.
 * Phase 13: Only "buyer" intent is supported for public users.
 * Admin accounts are created manually in Supabase dashboard + Prisma.
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
      throw new ValidationError("Not authenticated with Supabase");
    }

    const name =
      body.name ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      null;

    // All public signups are buyers. Admin accounts are provisioned manually.
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
