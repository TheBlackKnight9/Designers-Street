import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { UserService } from "@/server/services/user-service";
import { ok, fail } from "@/server/utils/api-response";
import { ForbiddenError } from "@/server/errors";
import { isDatabaseEnabled } from "@/server/utils/env";

export const runtime = "nodejs";
const users = new UserService();

/**
 * GET /api/auth/me — designer dashboard session only.
 * Does not promote buyers. Buyers should use GET /api/account/me.
 */
export async function GET() {
  try {
    if (!isDatabaseEnabled()) {
      throw new ForbiddenError("Designer dashboard requires database mode");
    }

    const ctx = await requireDashboardContext();

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
