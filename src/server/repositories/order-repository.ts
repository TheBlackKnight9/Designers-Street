import { prisma } from "@/server/db";
import type { Order, OrderEvent, OrderItem, OrderStatus, Prisma } from "@prisma/client";

export type OrderWithDetails = Order & {
  items: OrderItem[];
  events: OrderEvent[];
};

export class OrderRepository {
  async create(
    data: {
      userId: string;
      subtotal: number;
      total: number;
      currency?: string;
      shippingAddress: Prisma.InputJsonValue;
      paymentStatus?: string;
      items: Array<{
        productId: string;
        name: string;
        brand: string;
        price: number;
        size: string;
        image: string;
        quantity: number;
      }>;
    },
    db: Prisma.TransactionClient | typeof prisma = prisma
  ): Promise<OrderWithDetails> {
    return db.order.create({
      data: {
        userId: data.userId,
        status: "pending",
        subtotal: data.subtotal,
        total: data.total,
        currency: data.currency ?? "INR",
        shippingAddress: data.shippingAddress,
        paymentStatus: data.paymentStatus ?? "pending",
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            brand: i.brand,
            price: i.price,
            size: i.size,
            image: i.image,
            quantity: i.quantity,
          })),
        },
        events: {
          create: {
            status: "pending",
            note: "Order created",
          },
        },
      },
      include: {
        items: true,
        events: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  async listByUser(userId: string): Promise<OrderWithDetails[]> {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        events: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByIdForUser(
    id: string,
    userId: string
  ): Promise<OrderWithDetails | null> {
    return prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: true,
        events: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    note?: string
  ): Promise<OrderWithDetails> {
    return prisma.order.update({
      where: { id },
      data: {
        status,
        events: {
          create: { status, note: note ?? `Status → ${status}` },
        },
      },
      include: {
        items: true,
        events: { orderBy: { createdAt: "asc" } },
      },
    });
  }
}
