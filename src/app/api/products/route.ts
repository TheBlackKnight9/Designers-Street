import { ProductService } from "@/server/services";
import { ok, fail } from "@/server/utils/api-response";
import { parseLimit } from "@/server/utils/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const designerId = searchParams.get("designerId");
    const category = searchParams.get("category");
    const service = new ProductService();

    if (designerId) {
      const data = await service.listByDesigner(designerId);
      return ok(data);
    }
    if (category) {
      const data = await service.listByCategory(category);
      return ok(data);
    }

    // limit reserved for future pagination
    parseLimit(searchParams.get("limit"), 50, 100);
    const data = await service.listProducts();
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
