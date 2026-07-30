import { NotificationService } from "@/server/services/notification-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

const notifications = new NotificationService();

/** GET /api/notifications */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "notifications:list");
    const user = await requireBuyerContext();
    const list = await notifications.list(user.id);
    return ok({ notifications: list });
  } catch (error) {
    return fail(error);
  }
}
