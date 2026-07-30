import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { DashboardProductService } from "@/server/services/dashboard-product-service";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import type { ProductStatus } from "@prisma/client";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/dashboard/products/:id/status */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ctx = await requireDashboardContext();
    const body = (await request.json()) as { status?: string };
    const status = body.status as ProductStatus | undefined;
    if (status !== "draft" && status !== "published" && status !== "archived") {
      throw new ValidationError("status must be draft, published, or archived");
    }
    const product = await new DashboardProductService().setStatus(
      ctx,
      id,
      status
    );
    return ok(product);
  } catch (error) {
    return fail(error);
  }
}
