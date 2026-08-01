import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { DashboardProductService } from "@/server/services/dashboard-product-service";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** GET /api/dashboard/profile */
export async function GET() {
  try {
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

/** PUT /api/dashboard/profile */
export async function PUT(request: Request) {
  try {
    const ctx = await requireDashboardContext();
    const body = (await request.json()) as Record<string, unknown>;
    const designer = await new DashboardProductService().updateProfile(
      ctx,
      body
    );
    return ok({ designer });
  } catch (error) {
    return fail(error);
  }
}
