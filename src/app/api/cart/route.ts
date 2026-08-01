import { CartService } from "@/server/services/cart-service";
import { resolveCartIdentity } from "@/server/utils/cart-identity";
import { ok, fail } from "@/server/utils/api-response";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { requireString } from "@/server/utils/validation";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

const carts = new CartService();

/** GET /api/cart */
export async function GET(request: Request) {
  try {
    enforcePublicRateLimit(request, "cart:get");
    const identity = await resolveCartIdentity({ ensureGuest: true });
    const data = await carts.getCart(identity);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/cart — add item { productId, size, quantity? } */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "cart:mutate");
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const productId = requireString(body.productId, "productId");
    const size = requireString(body.size, "size");
    const quantity =
      typeof body.quantity === "number" ? Math.floor(body.quantity) : 1;
    if (quantity < 1) throw new ValidationError("quantity must be >= 1");

    const identity = await resolveCartIdentity({ ensureGuest: true });
    const data = await carts.addItem(identity, { productId, size, quantity });
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

/** PATCH /api/cart — update quantity { productId, size, quantity } */
export async function PATCH(request: Request) {
  try {
    enforcePublicRateLimit(request, "cart:mutate");
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const productId = requireString(body.productId, "productId");
    const size = requireString(body.size, "size");
    if (typeof body.quantity !== "number") {
      throw new ValidationError("quantity is required");
    }
    const identity = await resolveCartIdentity({ ensureGuest: true });
    const data = await carts.updateQuantity(identity, {
      productId,
      size,
      quantity: Math.floor(body.quantity),
    });
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

/** DELETE /api/cart — remove item or clear. Query: productId&size or ?all=1 */
export async function DELETE(request: Request) {
  try {
    enforcePublicRateLimit(request, "cart:mutate");
    const url = new URL(request.url);
    const identity = await resolveCartIdentity({ ensureGuest: true });

    if (url.searchParams.get("all") === "1") {
      return ok(await carts.clear(identity));
    }

    const productId = requireString(
      url.searchParams.get("productId"),
      "productId"
    );
    const size = requireString(url.searchParams.get("size"), "size");
    return ok(await carts.removeItem(identity, { productId, size }));
  } catch (error) {
    return fail(error);
  }
}
