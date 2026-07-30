import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { DashboardProductService } from "@/server/services/dashboard-product-service";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; mediaId: string }> };

/** DELETE /api/dashboard/products/:id/media/:mediaId */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id, mediaId } = await params;
    const ctx = await requireDashboardContext();
    const product = await new DashboardProductService().deleteOwnedMedia(
      ctx,
      id,
      mediaId
    );
    return ok(product);
  } catch (error) {
    return fail(error);
  }
}
