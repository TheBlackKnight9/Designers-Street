import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureDesignerAccount } from "@/server/auth/dashboard-session";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** GET /api/auth/me — current dashboard user + house */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not signed in" } },
        { status: 401 }
      );
    }

    const ctx = await ensureDesignerAccount({
      authUserId: user.id,
      email: user.email,
      name:
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        null,
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
        foundingStory: ctx.designer.foundingStory,
        location: ctx.designer.location,
        website: ctx.designer.website,
        offersBespoke: ctx.designer.offersBespoke,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
