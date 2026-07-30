import { prisma } from "@/server/db";
import type { Notification } from "@prisma/client";

export class NotificationRepository {
  async create(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    orderId?: string | null;
  }): Promise<Notification> {
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
}
