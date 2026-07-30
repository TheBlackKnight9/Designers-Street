import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { DashboardProductService } from "@/server/services/dashboard-product-service";
import { ok, fail } from "@/server/utils/api-response";
import type { ProductStatus } from "@prisma/client";

export const runtime = "nodejs";

/** GET /api/dashboard/products?status=draft|published|archived */
export async function GET(request: Request) {
  try {
    const ctx = await requireDashboardContext();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status =
      statusParam === "draft" ||
      statusParam === "published" ||
      statusParam === "archived"
        ? (statusParam as ProductStatus)
        : undefined;

    const service = new DashboardProductService();
    const [products, counts] = await Promise.all([
      service.list(ctx, status),
      service.counts(ctx),
    ]);

    return ok({ products, counts });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/dashboard/products */
export async function POST(request: Request) {
  try {
    const ctx = await requireDashboardContext();
    const body = (await request.json()) as Record<string, unknown>;
    const product = await new DashboardProductService().create(ctx, body);
    return ok(product, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
