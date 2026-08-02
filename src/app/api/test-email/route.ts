import { EmailService } from "@/server/services/email-service";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** GET /api/test-email?to=your_email@example.com - Test Resend Email Sending */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get("to") || "ayushrajeshpal08@gmail.com";

    const emailService = new EmailService();
    const result = await emailService.sendOrderConfirmation({
      to,
      customerName: "Ayush Pal",
      orderId: `ORD_${Date.now().toString().slice(-6)}`,
      totalAmount: 185000,
    });

    if (result.success) {
      return ok({
        message: `Email dispatched successfully via Resend API!`,
        sentTo: to,
        resendEmailId: result.id,
      });
    } else {
      return fail(new Error(`Resend Email dispatch failed: ${result.error || "Unknown error"}`));
    }
  } catch (error) {
    return fail(error);
  }
}
