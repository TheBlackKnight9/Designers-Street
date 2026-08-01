import { DesignerService } from "@/server/services";
import { ok, fail } from "@/server/utils/api-response";

type Params = { params: Promise<{ handle: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { handle } = await params;
    const data = await new DesignerService().getByHandle(handle);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
