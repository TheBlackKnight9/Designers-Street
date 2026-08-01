import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { DashboardProductService } from "@/server/services/dashboard-product-service";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** PUT /api/dashboard/products/:id/media/order — body: { mediaIds: string[] } */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ctx = await requireDashboardContext();
    const body = (await request.json()) as { mediaIds?: string[] };
    if (!Array.isArray(body.mediaIds)) {
      throw new ValidationError("mediaIds array is required");
    }
    const product = await new DashboardProductService().reorderMedia(
      ctx,
      id,
      body.mediaIds.map(String)
    );
    return ok(product);
  } catch (error) {
    return fail(error);
  }
}
