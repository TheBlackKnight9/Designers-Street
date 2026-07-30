import { NotificationService } from "@/server/services/notification-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { NotFoundError } from "@/server/errors";

export const runtime = "nodejs";

const notifications = new NotificationService();

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/notifications/[id] — mark read */
export async function PATCH(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "notifications:mutate");
    const { id } = await ctx.params;
    const user = await requireBuyerContext();
    const row = await notifications.markRead(user.id, id);
    if (!row) throw new NotFoundError("Notification not found");
    return ok({ notification: row });
  } catch (error) {
    return fail(error);
  }
}
