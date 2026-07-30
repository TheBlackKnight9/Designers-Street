import { createClient } from "@/lib/supabase/server";
import { ensureDesignerAccount } from "@/server/auth/dashboard-session";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/** POST /api/auth/bootstrap — sync Prisma User + DesignerHouse after signup/login */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      houseName?: string;
      handle?: string;
      name?: string;
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      throw new ValidationError("Not authenticated with Supabase");
    }

    const ctx = await ensureDesignerAccount({
      authUserId: user.id,
      email: user.email,
      name:
        body.name ||
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        null,
      houseName: body.houseName ?? null,
      handle: body.handle ?? null,
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
