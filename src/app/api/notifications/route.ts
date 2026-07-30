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
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get("unreadCount") === "1";
    if (unreadOnly) {
      const count = await notifications.unreadCount(user.id);
      return ok({ unreadCount: count });
    }
    const list = await notifications.list(user.id);
    return ok({ notifications: list });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/notifications — mark all read { action: "mark_all_read" } */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "notifications:mutate");
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
    };
    if (body.action === "mark_all_read") {
      const count = await notifications.markAllRead(user.id);
      return ok({ marked: count });
    }
    return ok({ ignored: true });
  } catch (error) {
    return fail(error);
  }
}
