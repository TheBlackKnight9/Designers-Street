import { MediaService } from "@/server/services/media-service";
import { ok, fail } from "@/server/utils/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const data = await new MediaService().getById(id);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const data = await new MediaService().delete(id);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
