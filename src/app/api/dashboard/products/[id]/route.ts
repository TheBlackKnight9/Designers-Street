import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { DashboardProductService } from "@/server/services/dashboard-product-service";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ctx = await requireDashboardContext();
    const product = await new DashboardProductService().get(ctx, id);
    return ok(product);
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ctx = await requireDashboardContext();
    const body = (await request.json()) as Record<string, unknown>;
    const product = await new DashboardProductService().update(ctx, id, body);
    return ok(product);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ctx = await requireDashboardContext();
    await new DashboardProductService().delete(ctx, id);
    return ok({ id, deleted: true });
  } catch (error) {
    return fail(error);
  }
}
