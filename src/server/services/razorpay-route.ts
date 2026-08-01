import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";

export type RazorpayAccountInput = {
  designerId: string;
  businessType: string;
  panNumber: string;
  gstin?: string | null;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  shippingPincode: string;
  shippingCity: string;
  shippingState: string;
};

export class RazorpayRouteService {
  /**
   * Registers a linked account with Razorpay Route API for automated split payouts.
   * If API key is unavailable or request fails, gracefully falls back to `manual_transfer_pending`.
   */
  async registerLinkedAccount(input: RazorpayAccountInput): Promise<{
    accountId: string;
    accountStatus: string;
    isFallback: boolean;
  }> {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const fallbackAccountId = `acc_manual_${input.designerId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 14)}`;

    if (!keyId || !keySecret || keyId.startsWith("rzp_test_mock")) {
      // Test environment or mock mode fallback
      if (isDatabaseEnabled()) {
        await prisma.designerHouse.update({
          where: { id: input.designerId },
          data: {
            razorpayAccountId: fallbackAccountId,
            razorpayAccountStatus: "manual_transfer_pending",
          },
        });
      }
      return {
        accountId: fallbackAccountId,
        accountStatus: "manual_transfer_pending",
        isFallback: true,
      };
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
      const payload = {
        email: `payouts_${input.designerId}@designersstreet.in`,
        phone: "9876543210",
        type: "route",
        legal_business_name: input.bankAccountName,
        business_type: input.businessType === "Pvt Ltd" ? "private_limited" : "individual",
        profile: {
          category: "fashion_and_lifestyle",
          subcategory: "designer_apparel",
          addresses: {
            operation: {
              street1: input.shippingCity,
              city: input.shippingCity,
              state: input.shippingState,
              postal_code: input.shippingPincode,
              country: "IN",
            },
          },
        },
      };

      const res = await fetch("https://api.razorpay.com/v1/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data?.id) {
        const accountId = data.id as string;
        const accountStatus = (data.status as string) || "activated";

        if (isDatabaseEnabled()) {
          await prisma.designerHouse.update({
            where: { id: input.designerId },
            data: {
              razorpayAccountId: accountId,
              razorpayAccountStatus: accountStatus,
            },
          });
        }

        return { accountId, accountStatus, isFallback: false };
      } else {
        throw new Error(data?.error?.description || "Razorpay Route API registration failed");
      }
    } catch {
      // Fallback for network/API errors
      if (isDatabaseEnabled()) {
        await prisma.designerHouse.update({
          where: { id: input.designerId },
          data: {
            razorpayAccountId: fallbackAccountId,
            razorpayAccountStatus: "manual_transfer_pending",
          },
        });
      }
      return {
        accountId: fallbackAccountId,
        accountStatus: "manual_transfer_pending",
        isFallback: true,
      };
    }
  }
}
