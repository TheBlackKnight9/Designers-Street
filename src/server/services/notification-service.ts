import { NotificationRepository } from "@/server/repositories/notification-repository";
import { isDatabaseEnabled } from "@/server/utils/env";
import { ValidationError } from "@/server/errors";

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
}
