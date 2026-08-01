import { AddressService } from "@/server/services/address-service";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

const addresses = new AddressService();

/** GET /api/addresses */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "addresses:list");
    const user = await requireBuyerContext();
    const list = await addresses.list(user.id);
    return ok({ addresses: list });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/addresses */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "addresses:mutate");
    const user = await requireBuyerContext();
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const address = await addresses.create(user.id, body);
    return ok({ address }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
