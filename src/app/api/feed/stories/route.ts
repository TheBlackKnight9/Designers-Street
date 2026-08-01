import { FeedService } from "@/server/services";
import { ok, fail } from "@/server/utils/api-response";

export async function GET() {
  try {
    const data = await new FeedService().getStories();
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
