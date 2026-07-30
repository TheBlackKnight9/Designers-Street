import { NotificationRepository } from "@/server/repositories/notification-repository";
import { isDatabaseEnabled } from "@/server/utils/env";
import { ValidationError } from "@/server/errors";
import { prisma } from "@/server/db";

export class NotificationService {
  constructor(private readonly notifications = new NotificationRepository()) {}

  private requireDb() {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("Notifications require USE_DATABASE=true");
    }
  }

  async list(userId: string, limit = 20) {
    this.requireDb();
    return this.notifications.listForUser(userId, limit);
  }

  async markRead(userId: string, id: string) {
    this.requireDb();
    return this.notifications.markRead(id, userId);
  }

  async markAllRead(userId: string) {
    this.requireDb();
    return this.notifications.markAllRead(userId);
  }

  async unreadCount(userId: string) {
    this.requireDb();
    return this.notifications.unreadCount(userId);
  }

  private async actorName(actorUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: actorUserId },
      select: { name: true, email: true },
    });
    return user?.name || user?.email?.split("@")[0] || "Someone";
  }

  async notifyOrderCreated(userId: string, orderId: string, total: number) {
    this.requireDb();
    return this.notifications.create({
      userId,
      type: "order_created",
      title: "Order placed",
      body: `Your order was created. Total ₹${total.toLocaleString("en-IN")}. Payment confirmation pending.`,
      orderId,
    });
  }

  async notifyOrderUpdated(
    userId: string,
    orderId: string,
    status: string
  ) {
    this.requireDb();
    return this.notifications.create({
      userId,
      type: "order_updated",
      title: "Order updated",
      body: `Your order status is now: ${status}.`,
      orderId,
    });
  }

  async notifyOrderDelivered(userId: string, orderId: string) {
    this.requireDb();
    return this.notifications.create({
      userId,
      type: "order_delivered",
      title: "Order delivered",
      body: "Your order has been delivered. Enjoy your piece.",
      orderId,
    });
  }

  async notifyNewFollower(
    userId: string,
    actorUserId: string,
    designerId: string
  ) {
    this.requireDb();
    const name = await this.actorName(actorUserId);
    return this.notifications.create({
      userId,
      type: "social_follow",
      title: "New follower",
      body: `${name} started following your house.`,
      designerId,
      actorUserId,
    });
  }

  async notifyPostLiked(
    userId: string,
    actorUserId: string,
    postId: string
  ) {
    this.requireDb();
    const name = await this.actorName(actorUserId);
    return this.notifications.create({
      userId,
      type: "social_like",
      title: "New like",
      body: `${name} liked your post.`,
      postId,
      actorUserId,
    });
  }

  async notifyProductLiked(
    userId: string,
    actorUserId: string,
    productId: string,
    productName: string
  ) {
    this.requireDb();
    const name = await this.actorName(actorUserId);
    return this.notifications.create({
      userId,
      type: "social_like",
      title: "New like",
      body: `${name} liked ${productName}.`,
      productId,
      actorUserId,
    });
  }

  async notifyPostCommented(
    userId: string,
    actorUserId: string,
    postId: string,
    _commentId: string
  ) {
    this.requireDb();
    const name = await this.actorName(actorUserId);
    return this.notifications.create({
      userId,
      type: "social_comment",
      title: "New comment",
      body: `${name} commented on your post.`,
      postId,
      actorUserId,
    });
  }

  async notifyCommentReply(
    userId: string,
    actorUserId: string,
    postId: string,
    _commentId: string
  ) {
    this.requireDb();
    const name = await this.actorName(actorUserId);
    return this.notifications.create({
      userId,
      type: "social_reply",
      title: "New reply",
      body: `${name} replied to your comment.`,
      postId,
      actorUserId,
    });
  }
}
