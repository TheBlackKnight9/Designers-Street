import { CartRepository, type CartWithItems } from "@/server/repositories/cart-repository";
import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError, ValidationError } from "@/server/errors";
import type { CartItem as UiCartItem } from "@/lib/types";

function toUiItems(cart: CartWithItems): UiCartItem[] {
  return cart.items.map((i) => ({
    productId: i.productId,
    name: i.name,
    brand: i.brand,
    price: i.price,
    size: i.size,
    image: i.image,
    quantity: i.quantity,
  }));
}

export class CartService {
  constructor(private readonly carts = new CartRepository()) {}

  private requireDb() {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("Cart requires USE_DATABASE=true");
    }
  }

  async getOrCreateCart(opts: {
    userId?: string | null;
    guestToken?: string | null;
  }): Promise<CartWithItems> {
    this.requireDb();
    if (opts.userId) {
      const existing = await this.carts.findByUserId(opts.userId);
      if (existing) return existing;
      return this.carts.createForUser(opts.userId);
    }
    if (opts.guestToken) {
      const existing = await this.carts.findByGuestToken(opts.guestToken);
      if (existing) return existing;
      return this.carts.createForGuest(opts.guestToken);
    }
    throw new ValidationError("userId or guestToken required");
  }

  async getCart(opts: {
    userId?: string | null;
    guestToken?: string | null;
  }): Promise<{ items: UiCartItem[]; total: number; itemCount: number }> {
    if (!isDatabaseEnabled()) {
      return { items: [], total: 0, itemCount: 0 };
    }

    try {
      let cart: CartWithItems | null = null;
      if (opts.userId) cart = await this.carts.findByUserId(opts.userId);
      else if (opts.guestToken)
        cart = await this.carts.findByGuestToken(opts.guestToken);

      const items = cart ? toUiItems(cart) : [];
      const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const itemCount = items.reduce((s, i) => s + i.quantity, 0);
      return { items, total, itemCount };
    } catch (err) {
      console.error("[CartService] Error fetching cart from database:", err);
      return { items: [], total: 0, itemCount: 0 };
    }
  }

  private async validateProductLine(input: {
    productId: string;
    size: string;
    quantity: number;
  }) {
    const product = await prisma.product.findFirst({
      where: { id: input.productId, status: "published" },
    });
    if (!product) throw new NotFoundError("Product not found");
    if (!product.sizes.includes(input.size)) {
      throw new ValidationError(`Size ${input.size} is not available`);
    }
    if (input.quantity < 1) {
      throw new ValidationError("Quantity must be at least 1");
    }
    if (
      product.piecesRemaining != null &&
      input.quantity > product.piecesRemaining
    ) {
      throw new ValidationError(
        `Only ${product.piecesRemaining} piece(s) remaining`
      );
    }
    return product;
  }

  async addItem(
    opts: { userId?: string | null; guestToken?: string | null },
    input: {
      productId: string;
      size: string;
      quantity?: number;
    }
  ) {
    this.requireDb();
    const qty = input.quantity ?? 1;
    const product = await this.validateProductLine({
      productId: input.productId,
      size: input.size,
      quantity: qty,
    });
    const cart = await this.getOrCreateCart(opts);
    const existing = cart.items.find(
      (i) => i.productId === input.productId && i.size === input.size
    );
    const nextQty = (existing?.quantity ?? 0) + qty;
    await this.validateProductLine({
      productId: input.productId,
      size: input.size,
      quantity: nextQty,
    });

    await this.carts.incrementItem(cart.id, {
      productId: product.id,
      name: product.name,
      brand: product.designerName,
      price: product.price,
      size: input.size,
      image: product.images[0] || "",
      delta: qty,
    });

    return this.getCart(opts);
  }

  async updateQuantity(
    opts: { userId?: string | null; guestToken?: string | null },
    input: { productId: string; size: string; quantity: number }
  ) {
    this.requireDb();
    const cart = await this.getOrCreateCart(opts);
    if (input.quantity <= 0) {
      await this.carts.deleteItemByKey(cart.id, input.productId, input.size);
      return this.getCart(opts);
    }
    await this.validateProductLine(input);
    const item = cart.items.find(
      (i) => i.productId === input.productId && i.size === input.size
    );
    if (!item) throw new NotFoundError("Cart item not found");
    await this.carts.updateQuantity(item.id, input.quantity);
    return this.getCart(opts);
  }

  async removeItem(
    opts: { userId?: string | null; guestToken?: string | null },
    input: { productId: string; size: string }
  ) {
    this.requireDb();
    const cart = await this.getOrCreateCart(opts);
    await this.carts.deleteItemByKey(cart.id, input.productId, input.size);
    return this.getCart(opts);
  }

  async clear(
    opts: { userId?: string | null; guestToken?: string | null }
  ) {
    this.requireDb();
    const cart = await this.getOrCreateCart(opts);
    await this.carts.clearItems(cart.id);
    return this.getCart(opts);
  }

  /** Merge guest cart into user cart after login; deletes guest cart. */
  async mergeGuestIntoUser(
    userId: string,
    guestToken: string
  ): Promise<{ items: UiCartItem[]; total: number; itemCount: number }> {
    this.requireDb();
    const guest = await this.carts.findByGuestToken(guestToken);
    const userCart = await this.getOrCreateCart({ userId });

    if (guest && guest.items.length > 0) {
      for (const item of guest.items) {
        try {
          await this.validateProductLine({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          });
        } catch {
          continue;
        }
        const existing = userCart.items.find(
          (i) => i.productId === item.productId && i.size === item.size
        );
        const qty = (existing?.quantity ?? 0) + item.quantity;
        await this.carts.upsertItem(userCart.id, {
          productId: item.productId,
          name: item.name,
          brand: item.brand,
          price: item.price,
          size: item.size,
          image: item.image,
          quantity: qty,
        });
      }
      await this.carts.deleteCart(guest.id);
    }

    return this.getCart({ userId });
  }
}
