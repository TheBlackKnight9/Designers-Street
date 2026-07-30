import { FeedService } from "@/server/services";
import { ok, fail } from "@/server/utils/api-response";
import { parseLimit } from "@/server/utils/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"), 10, 50);
    const cursor = searchParams.get("cursor");
    const data = await new FeedService().getFeed({ limit, cursor });
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
