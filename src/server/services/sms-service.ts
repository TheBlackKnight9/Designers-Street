import { EmailService } from "@/server/services/email-service";

export type SMSEventType = "ORDER_PLACED" | "ORDER_SHIPPED" | "ORDER_DELIVERED";

export type SMSNotificationPayload = {
  mobileNumber: string;
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  totalAmount?: number;
};

export class SMSService {
  private authKey = process.env.MSG91_AUTH_KEY;
  private senderId = process.env.MSG91_SENDER_ID || "DSLUXU";
  private emailService = new EmailService();

  private flowIds: Record<SMSEventType, string | undefined> = {
    ORDER_PLACED: process.env.MSG91_FLOW_ORDER_PLACED,
    ORDER_SHIPPED: process.env.MSG91_FLOW_ORDER_SHIPPED,
    ORDER_DELIVERED: process.env.MSG91_FLOW_ORDER_DELIVERED,
  };

  /**
   * Triggers SMS & Resend Email notification.
   * Uses Resend Email API as reliable fallback when MSG91 SMS key is unconfigured.
   * Safe execution: Never throws exceptions to caller.
   */
  async sendOrderNotification(event: SMSEventType, payload: SMSNotificationPayload): Promise<boolean> {
    try {
      const cleanPhone = payload.mobileNumber ? payload.mobileNumber.replace(/\D/g, "") : "";
      const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

      // Email Notification via Resend (High Reliability Fallback)
      const recipientEmail = payload.customerEmail || process.env.TEST_NOTIFICATION_EMAIL || "ayush.customer@designersstreet.com";
      
      if (recipientEmail) {
        if (event === "ORDER_PLACED") {
          await this.emailService.sendOrderConfirmation({
            to: recipientEmail,
            customerName: payload.customerName || "Valued Patron",
            orderId: payload.orderId,
            totalAmount: payload.totalAmount || 0,
          });
        } else {
          await this.emailService.sendOrderStatusUpdate({
            to: recipientEmail,
            customerName: payload.customerName || "Valued Patron",
            orderId: payload.orderId,
            status: event === "ORDER_SHIPPED" ? "Shipped" : "Delivered",
            courierName: payload.courierName,
            trackingNumber: payload.trackingNumber,
          });
        }
      }

      if (!this.authKey || !this.flowIds[event]) {
        console.log(`[SMS & Email Gateway Log] Event: ${event} -> SMS: ${formattedPhone} | Email: ${recipientEmail} | Order: #${payload.orderId.slice(-6)}`);
        return true;
      }

      const flowId = this.flowIds[event];
      const requestBody = {
        template_id: flowId,
        short_url: "1",
        recipients: [
          {
            mobiles: formattedPhone,
            name: payload.customerName || "Valued Customer",
            order_id: payload.orderId,
            courier: payload.courierName || "Courier Partner",
            tracking_number: payload.trackingNumber || "N/A",
            tracking_url: payload.trackingUrl || "#",
            amount: payload.totalAmount ? `₹${payload.totalAmount}` : "",
          },
        ],
      };

      const response = await fetch("https://control.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: this.authKey,
        },
        body: JSON.stringify(requestBody),
      });

      const resData = await response.json().catch(() => ({}));
      if (response.ok) {
        console.log(`[MSG91 SMS Success] Event: ${event} -> ${formattedPhone}`);
        return true;
      } else {
        console.warn(`[MSG91 SMS Warning] API Response Error:`, resData);
        return false;
      }
    } catch (error) {
      console.error(`[SMS & Email Gateway Error] Event: ${event}`, error);
      return false;
    }
  }
}
