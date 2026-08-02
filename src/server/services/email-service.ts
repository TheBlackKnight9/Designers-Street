import { Resend } from "resend";
import { logger } from "@/server/utils/logger";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.warn("[EmailService] RESEND_API_KEY is not set — emails will not be delivered.");
}
const resend = new Resend(apiKey ?? "");
const SENDER = process.env.EMAIL_FROM || "Designers Street <onboarding@resend.dev>";
const OWNER_EMAIL = "ayushrajeshpal08@gmail.com";

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export class EmailService {
  /**
   * Generic low-level email dispatch using Resend API.
   * Auto-handles Resend testing sandbox restrictions (delivering to owner email).
   */
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      let recipient = options.to;
      if (!recipient || !recipient.includes("@")) {
        recipient = OWNER_EMAIL;
      }

      let response = await resend.emails.send({
        from: SENDER,
        to: recipient,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      });

      // Fallback: If Resend sandbox rejects sending to unverified recipient, route to owner email
      if (response.error && SENDER.includes("onboarding@resend.dev")) {
        logger.warn("resend_sandbox_rerouting_to_owner", {
          originalRecipient: recipient,
          error: response.error,
        });

        response = await resend.emails.send({
          from: SENDER,
          to: OWNER_EMAIL,
          subject: `[Dev Sandbox for ${recipient}] ${options.subject}`,
          html: options.html,
          text: options.text || options.subject,
        });
      }

      if (response.error) {
        logger.error("resend_email_failed", { error: response.error, to: recipient });
        return { success: false, error: response.error.message };
      }

      logger.info("resend_email_sent", { id: response.data?.id, to: recipient });
      return { success: true, id: response.data?.id };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error("resend_email_exception", { message: msg, to: options.to });
      return { success: false, error: msg };
    }
  }

  /**
   * Send Order Confirmation Email
   */
  async sendOrderConfirmation(payload: {
    to: string;
    customerName: string;
    orderId: string;
    totalAmount: number;
    itemsCount?: number;
  }) {
    const subject = `✨ Order Confirmed #${payload.orderId.slice(-8)} — Designers Street`;
    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #0d0d0d; color: #f4f4f0; border-radius: 16px; border: 1px solid #2a2a2a;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #222;">
          <h1 style="font-size: 24px; letter-spacing: 4px; text-transform: uppercase; color: #D4AF37; margin: 0;">DESIGNERS STREET</h1>
          <p style="font-size: 11px; letter-spacing: 2px; color: #888; margin-top: 5px; text-transform: uppercase;">Haute Couture & Atelier Marketplace</p>
        </div>
        <div style="padding: 25px 0;">
          <p style="font-size: 16px; color: #fff;">Dear ${payload.customerName || "Valued Patron"},</p>
          <p style="font-size: 14px; color: #ccc; line-height: 1.6;">Thank you for your luxury purchase. Your atelier creation has been confirmed and placed into production.</p>
          
          <div style="background-color: #161616; padding: 20px; border-radius: 12px; border-left: 3px solid #D4AF37; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase;">Order Number</p>
            <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: bold; color: #fff;">#${payload.orderId}</p>
            <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase;">Total Amount Paid</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #D4AF37;">₹${payload.totalAmount.toLocaleString("en-IN")}</p>
          </div>
          
          <p style="font-size: 13px; color: #aaa;">You can track your order status live anytime in your customer account dashboard.</p>
        </div>
        <div style="text-align: center; border-top: 1px solid #222; pt: 20px; font-size: 11px; color: #666;">
          <p>© ${new Date().getFullYear()} Designers Street. All rights reserved.</p>
        </div>
      </div>
    `;
    return this.sendEmail({ to: payload.to, subject, html });
  }

  /**
   * Send Order Status Update Email (Shipped / Delivered / Processing)
   */
  async sendOrderStatusUpdate(payload: {
    to: string;
    customerName: string;
    orderId: string;
    status: string;
    courierName?: string;
    trackingNumber?: string;
  }) {
    const subject = `📦 Order Status Update: ${payload.status.toUpperCase()} #${payload.orderId.slice(-8)}`;
    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #0d0d0d; color: #f4f4f0; border-radius: 16px;">
        <h1 style="font-size: 22px; color: #D4AF37; text-align: center; letter-spacing: 3px;">DESIGNERS STREET</h1>
        <p style="font-size: 15px; color: #fff;">Hello ${payload.customerName || "Patron"},</p>
        <p style="font-size: 14px; color: #ccc;">Your order <strong>#${payload.orderId}</strong> status has been updated to: <span style="color: #D4AF37; font-weight: bold;">${payload.status.toUpperCase()}</span>.</p>
        ${
          payload.trackingNumber
            ? `<div style="background-color: #1a1a1a; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0; font-size: 12px; color: #888;">Courier Partner: ${payload.courierName || "Express Courier"}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #fff; font-weight: bold;">Tracking ID: ${payload.trackingNumber}</p>
               </div>`
            : ""
        }
      </div>
    `;
    return this.sendEmail({ to: payload.to, subject, html });
  }

  /**
   * Send OTP Verification Code Email
   */
  async sendOTP(payload: { to: string; otpCode: string; purpose?: string }) {
    const subject = `🔐 Your Verification Code: ${payload.otpCode} — Designers Street`;
    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #0d0d0d; color: #f4f4f0; border-radius: 16px; text-align: center;">
        <h1 style="font-size: 22px; color: #D4AF37; letter-spacing: 3px;">DESIGNERS STREET</h1>
        <p style="font-size: 13px; color: #888; text-transform: uppercase; margin-bottom: 25px;">${payload.purpose || "Authentication Code"}</p>
        <div style="background-color: #1a1a1a; padding: 25px; border-radius: 12px; border: 1px border #333; display: inline-block; margin: 0 auto;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #D4AF37;">${payload.otpCode}</span>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 25px;">This security code will expire in 10 minutes. Please do not share it with anyone.</p>
      </div>
    `;
    return this.sendEmail({ to: payload.to, subject, html });
  }
}
