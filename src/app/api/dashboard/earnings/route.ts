import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { FinancialCalculatorService } from "@/server/services/financial-calculator";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";
const financialCalc = new FinancialCalculatorService();

/** GET /api/dashboard/earnings */
export async function GET() {
  try {
    const { designer } = await requireDashboardContext();

    const orders = await prisma.order.findMany({
      where: { designerId: designer.id },
      include: { payout: true },
      orderBy: { createdAt: "desc" },
    });

    let grossSalesMonth = 0;
    let netEarningsMonth = 0;
    let clearanceHoldAmount = 0;

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const ledger = orders.map((order) => {
      const fin = financialCalc.calculateFinancialSplit({
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
      });

      if (new Date(order.createdAt) >= startOfMonth) {
        grossSalesMonth += fin.grossTotal;
        netEarningsMonth += fin.designerNetEarnings;
      }

      if (!order.payoutId && order.status !== "cancelled") {
        clearanceHoldAmount += fin.designerNetEarnings;
      }

      let payoutStatus = "Clearance Hold";
      if (order.payoutId) payoutStatus = "Paid";
      else if (order.transferOnHoldUntil && new Date(order.transferOnHoldUntil) <= new Date()) payoutStatus = "Ready for Payout";

      return {
        id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        payoutStatus,
        subtotal: fin.subtotal,
        shippingFee: fin.shippingFee,
        grossTotal: fin.grossTotal,
        platformCommission: fin.platformCommission,
        commissionGst: fin.commissionGst,
        tcsDeducted: fin.tcsDeducted,
        designerNetEarnings: fin.designerNetEarnings,
      };
    });

    // Next Payout Date estimation (1st or 15th cycle)
    const now = new Date();
    const currentDay = now.getDate();
    let nextPayoutDate = new Date(now.getFullYear(), now.getMonth(), 15);
    if (currentDay >= 15) {
      nextPayoutDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    return ok({
      metrics: {
        grossSalesMonth,
        netEarningsMonth,
        clearanceHoldAmount,
        nextPayoutDate: nextPayoutDate.toISOString(),
      },
      ledger,
    });
  } catch (error) {
    return fail(error);
  }
}
