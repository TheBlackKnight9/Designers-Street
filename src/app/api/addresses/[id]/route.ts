import { AddressService } from "@/server/services/address-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

const addresses = new AddressService();

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/addresses/[id] */
export async function PATCH(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "addresses:mutate");
    const { id } = await ctx.params;
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const address = await addresses.update(user.id, id, body);
    return ok({ address });
  } catch (error) {
    return fail(error);
  }
}

/** DELETE /api/addresses/[id] */
export async function DELETE(request: Request, ctx: Ctx) {
  try {
    enforcePublicRateLimit(request, "addresses:mutate");
    const { id } = await ctx.params;
    const user = await requireBuyerContext();
    await addresses.remove(user.id, id);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
