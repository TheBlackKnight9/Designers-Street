import { DesignerService } from "@/server/services";
import { ok, fail } from "@/server/utils/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const data = await new DesignerService().getById(id);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
