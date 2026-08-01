import { prisma } from "@/server/db";
import type { Notification } from "@prisma/client";

export type NotificationCreateInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  orderId?: string | null;
  postId?: string | null;
  productId?: string | null;
  designerId?: string | null;
  actorUserId?: string | null;
};

export class NotificationRepository {
  async create(data: NotificationCreateInput): Promise<Notification> {
    return prisma.notification.create({ data });
  }

  async listForUser(
    userId: string,
    limit = 20
  ): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async markRead(id: string, userId: string): Promise<Notification | null> {
    const existing = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  }

  async unreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, readAt: null },
    });
  }
}
