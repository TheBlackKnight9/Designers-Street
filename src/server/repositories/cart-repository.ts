import { prisma } from "@/server/db";
import type { Cart, CartItem } from "@prisma/client";

export type CartWithItems = Cart & { items: CartItem[] };

export class CartRepository {
  async findByUserId(userId: string): Promise<CartWithItems | null> {
    return prisma.cart.findUnique({
      where: { userId },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });
  }

  async findByGuestToken(guestToken: string): Promise<CartWithItems | null> {
    return prisma.cart.findUnique({
      where: { guestToken },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });
  }

  async createForUser(userId: string): Promise<CartWithItems> {
    return prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
  }

  async createForGuest(guestToken: string): Promise<CartWithItems> {
    return prisma.cart.create({
      data: { guestToken },
      include: { items: true },
    });
  }

  async upsertItem(
    cartId: string,
    data: {
      productId: string;
      name: string;
      brand: string;
      price: number;
      size: string;
      image: string;
      quantity: number;
    }
  ): Promise<CartItem> {
    return prisma.cartItem.upsert({
      where: {
        cartId_productId_size: {
          cartId,
          productId: data.productId,
          size: data.size,
        },
      },
      create: { cartId, ...data },
      update: {
        quantity: data.quantity,
        name: data.name,
        brand: data.brand,
        price: data.price,
        image: data.image,
      },
    });
  }

  async incrementItem(
    cartId: string,
    data: {
      productId: string;
      name: string;
      brand: string;
      price: number;
      size: string;
      image: string;
      delta: number;
    }
  ): Promise<CartItem> {
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_size: {
          cartId,
          productId: data.productId,
          size: data.size,
        },
      },
    });
    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + data.delta },
      });
    }
    return prisma.cartItem.create({
      data: {
        cartId,
        productId: data.productId,
        name: data.name,
        brand: data.brand,
        price: data.price,
        size: data.size,
        image: data.image,
        quantity: Math.max(1, data.delta),
      },
    });
  }

  async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async deleteItem(itemId: string): Promise<void> {
    await prisma.cartItem.delete({ where: { id: itemId } });
  }

  async deleteItemByKey(
    cartId: string,
    productId: string,
    size: string
  ): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { cartId, productId, size },
    });
  }

  async clearItems(cartId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { cartId } });
  }

  async deleteCart(cartId: string): Promise<void> {
    await prisma.cart.delete({ where: { id: cartId } });
  }
}
