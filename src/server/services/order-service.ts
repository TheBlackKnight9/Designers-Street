import { OrderRepository } from "@/server/repositories/order-repository";
import { CartService } from "@/server/services/cart-service";
import { NotificationService } from "@/server/services/notification-service";
import { AddressRepository } from "@/server/repositories/address-repository";
import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError, ValidationError } from "@/server/errors";
import { requireString } from "@/server/utils/validation";
import type { OrderStatus, Prisma } from "@prisma/client";

export class OrderService {
  constructor(
    private readonly orders = new OrderRepository(),
    private readonly carts = new CartService(),
    private readonly notifications = new NotificationService(),
    private readonly addresses = new AddressRepository()
  ) {}

  private requireDb() {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("Orders require USE_DATABASE=true");
    }
  }

  async list(userId: string) {
    this.requireDb();
    return this.orders.listByUser(userId);
  }

  async get(userId: string, orderId: string) {
    this.requireDb();
    const order = await this.orders.findByIdForUser(orderId, userId);
    if (!order) throw new NotFoundError("Order not found");
    return order;
  }

  /**
   * Create order from the authenticated user's server cart.
   * Payment is placeholder: status stays pending / paymentStatus pending.
   */
  async checkout(
    userId: string,
    input: {
      addressId?: string;
      shippingAddress?: {
        fullName: string;
        phone?: string | null;
        line1: string;
        line2?: string | null;
        city: string;
        state: string;
        postalCode: string;
        country?: string;
      };
    }
  ) {
    this.requireDb();

    let shipping: Prisma.InputJsonValue;
    if (input.addressId) {
      const addr = await this.addresses.findById(input.addressId, userId);
      if (!addr) throw new NotFoundError("Address not found");
      shipping = {
        fullName: addr.fullName,
        phone: addr.phone,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        addressId: addr.id,
      };
    } else if (input.shippingAddress) {
      const a = input.shippingAddress;
      shipping = {
        fullName: requireString(a.fullName, "fullName"),
        phone: a.phone ?? null,
        line1: requireString(a.line1, "line1"),
        line2: a.line2 ?? null,
        city: requireString(a.city, "city"),
        state: requireString(a.state, "state"),
        postalCode: requireString(a.postalCode, "postalCode"),
        country: a.country ?? "IN",
      };
    } else {
      throw new ValidationError("Shipping address is required");
    }

    const cart = await this.carts.getCart({ userId });
    if (cart.items.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    const order = await prisma.$transaction(async (tx) => {
      // Re-validate + conditional stock decrement inside transaction
      for (const item of cart.items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, status: "published" },
        });
        if (!product) {
          throw new ValidationError(`Product unavailable: ${item.name}`);
        }
        if (!product.sizes.includes(item.size)) {
          throw new ValidationError(
            `Size ${item.size} unavailable for ${item.name}`
          );
        }
        if (
          product.piecesRemaining != null &&
          item.quantity > product.piecesRemaining
        ) {
          throw new ValidationError(
            `Insufficient stock for ${item.name} (only ${product.piecesRemaining} left)`
          );
        }
        if (product.piecesRemaining != null) {
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              piecesRemaining: { gte: item.quantity },
            },
            data: {
              piecesRemaining: { decrement: item.quantity },
            },
          });
          if (updated.count === 0) {
            throw new ValidationError(
              `Insufficient stock for ${item.name}`
            );
          }
        }
      }

      const created = await this.orders.create(
        {
          userId,
          subtotal: cart.total,
          total: cart.total,
          shippingAddress: shipping,
          paymentStatus: "pending",
          items: cart.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            brand: i.brand,
            price: i.price,
            size: i.size,
            image: i.image,
            quantity: i.quantity,
          })),
        },
        tx
      );

      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }

      return created;
    });

    await this.notifications.notifyOrderCreated(userId, order.id, order.total);

    return order;
  }

  /** Internal/status updates — used for timeline + notifications. */
  async updateStatus(
    orderId: string,
    userId: string,
    status: OrderStatus,
    note?: string
  ) {
    this.requireDb();
    const existing = await this.orders.findByIdForUser(orderId, userId);
    if (!existing) throw new NotFoundError("Order not found");
    const updated = await this.orders.updateStatus(orderId, status, note);
    if (status === "delivered") {
      await this.notifications.notifyOrderDelivered(userId, orderId);
    } else {
      await this.notifications.notifyOrderUpdated(userId, orderId, status);
    }
    return updated;
  }
}
