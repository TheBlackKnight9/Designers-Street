import { NotificationRepository } from "@/server/repositories/notification-repository";
import { isDatabaseEnabled } from "@/server/utils/env";
import { ValidationError } from "@/server/errors";
import { prisma } from "@/server/db";
import { EmailService } from "@/server/services/email-service";

export class NotificationService {
  private emailService = new EmailService();

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

  private async getUserEmailAndName(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      return user;
    } catch {
      return null;
    }
  }

  async notifyOrderCreated(userId: string, orderId: string, total: number) {
    this.requireDb();

    // Send Resend Email Notification
    const user = await this.getUserEmailAndName(userId);
    if (user?.email) {
      await this.emailService.sendOrderConfirmation({
        to: user.email,
        customerName: user.name || "Valued Patron",
        orderId,
        totalAmount: total,
      });
    }

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

    const user = await this.getUserEmailAndName(userId);
    if (user?.email) {
      await this.emailService.sendOrderStatusUpdate({
        to: user.email,
        customerName: user.name || "Valued Patron",
        orderId,
        status,
      });
    }

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

    const user = await this.getUserEmailAndName(userId);
    if (user?.email) {
      await this.emailService.sendOrderStatusUpdate({
        to: user.email,
        customerName: user.name || "Valued Patron",
        orderId,
        status: "Delivered",
      });
    }

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

  async notifyAppointmentRequested(
    userId: string,
    designerId: string,
    _appointmentId: string,
    designerName: string
  ) {
    this.requireDb();
    return this.notifications.create({
      userId,
      type: "appointment_requested",
      title: "Consultation requested",
      body: `Your private appointment request with ${designerName} was submitted.`,
      designerId,
    });
  }

  async notifyDesignerAppointment(
    ownerUserId: string,
    designerId: string,
    _appointmentId: string
  ) {
    this.requireDb();
    return this.notifications.create({
      userId: ownerUserId,
      type: "appointment_incoming",
      title: "New appointment request",
      body: "A client requested a private consultation with your house.",
      designerId,
    });
  }

  async notifyAppointmentStatus(
    userId: string,
    designerId: string,
    _appointmentId: string,
    status: string
  ) {
    this.requireDb();
    return this.notifications.create({
      userId,
      type: "appointment_status",
      title: "Appointment update",
      body: `Your consultation request is now ${status}.`,
      designerId,
    });
  }

  async notifyBespokeSubmitted(
    userId: string,
    designerId: string | null,
    _requestId: string
  ) {
    this.requireDb();
    return this.notifications.create({
      userId,
      type: "bespoke_submitted",
      title: "Bespoke request submitted",
      body: "Your custom design request is with the atelier for review.",
      designerId: designerId ?? undefined,
    });
  }

  async notifyDesignerBespoke(
    ownerUserId: string,
    designerId: string,
    _requestId: string
  ) {
    this.requireDb();
    return this.notifications.create({
      userId: ownerUserId,
      type: "bespoke_incoming",
      title: "New bespoke request",
      body: "A client submitted a custom outfit request.",
      designerId,
    });
  }

  async notifyBespokeStatus(
    userId: string,
    designerId: string | null,
    _requestId: string,
    status: string
  ) {
    this.requireDb();
    return this.notifications.create({
      userId,
      type: "bespoke_status",
      title: "Bespoke update",
      body: `Your custom request is now ${status}.`,
      designerId: designerId ?? undefined,
    });
  }
}
