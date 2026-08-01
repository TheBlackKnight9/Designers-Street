export type SMSEventType = "ORDER_PLACED" | "ORDER_SHIPPED" | "ORDER_DELIVERED";

export type SMSNotificationPayload = {
  mobileNumber: string;
  orderId: string;
  customerName?: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  totalAmount?: number;
};

export class SMSService {
  private authKey = process.env.MSG91_AUTH_KEY;
  private senderId = process.env.MSG91_SENDER_ID || "DSLUXU";
  private flowIds: Record<SMSEventType, string | undefined> = {
    ORDER_PLACED: process.env.MSG91_FLOW_ORDER_PLACED,
    ORDER_SHIPPED: process.env.MSG91_FLOW_ORDER_SHIPPED,
    ORDER_DELIVERED: process.env.MSG91_FLOW_ORDER_DELIVERED,
  };

  /**
   * Triggers SMS notification via MSG91 Flow API.
   * Safe execution: Never throws exceptions to caller.
   */
  async sendOrderNotification(event: SMSEventType, payload: SMSNotificationPayload): Promise<boolean> {
    try {
      const cleanPhone = payload.mobileNumber.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

      if (!this.authKey || !this.flowIds[event]) {
        console.log(`[SMS Gateway Simulated Log] Event: ${event} -> To: ${formattedPhone} | Order: #${payload.orderId.slice(-6)}`);
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
      console.error(`[MSG91 SMS Isolated Error] Event: ${event}`, error);
      return false;
    }
  }
}
