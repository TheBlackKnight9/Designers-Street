import { EditorialService } from "@/server/services/editorial-service";
import { ok, fail } from "@/server/utils/api-response";

const service = new EditorialService();

export async function GET() {
  try {
    const payload = await service.getHomePayload();
    return ok(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load home editorial";
    return fail(message, 500);
  }
}
