import { prisma } from "@/server/db";
import { FinancialCalculatorService } from "./financial-calculator";

const financialCalc = new FinancialCalculatorService();

export class PayoutEngineService {
  /**
   * Executes bi-monthly payout batch for 1st or 15th cycle.
   */
  async executeBiMonthlyPayoutBatch(): Promise<{
    createdPayoutsCount: number;
    totalPayoutAmountPaise: number;
  }> {
    const now = new Date();

    // Query eligible orders
    const eligibleOrders = await prisma.order.findMany({
      where: {
        payoutId: null,
        status: { in: ["delivered", "paid", "shipped"] },
        OR: [
          { transferOnHoldUntil: null },
          { transferOnHoldUntil: { lte: now } },
        ],
        disputes: {
          none: { status: { in: ["open", "investigating"] } },
        },
      },
      include: {
        designer: {
          include: { businessVerification: true },
        },
      },
    });

    // Group by designer
    const grouped: Record<string, typeof eligibleOrders> = {};
    for (const order of eligibleOrders) {
      if (!order.designerId) continue;
      if (!grouped[order.designerId]) {
        grouped[order.designerId] = [];
      }
      grouped[order.designerId].push(order);
    }

    let createdPayoutsCount = 0;
    let totalPayoutAmountPaise = 0;

    for (const [designerId, orders] of Object.entries(grouped)) {
      let grossSales = 0;
      let totalCommission = 0;
      let totalCommissionGst = 0;
      let totalTcsDeducted = 0;
      let netAmount = 0;

      for (const order of orders) {
        const fin = financialCalc.calculateFinancialSplit({
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
        });

        grossSales += fin.grossTotal;
        totalCommission += fin.platformCommission;
        totalCommissionGst += fin.commissionGst;
        totalTcsDeducted += fin.tcsDeducted;
        netAmount += fin.designerNetEarnings;
      }

      // Period start/end dates
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = now;

      // Create Payout record
      const payout = await prisma.payout.create({
        data: {
          designerId,
          payoutPeriodStart: periodStart,
          payoutPeriodEnd: periodEnd,
          grossSales,
          totalCommission,
          totalCommissionGst,
          totalTcsDeducted,
          netAmount,
          status: "completed",
          method: "razorpay_route",
          paidAt: now,
        },
      });

      // Link orders to this payout batch
      const orderIds = orders.map((o) => o.id);
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { payoutId: payout.id },
      });

      createdPayoutsCount++;
      totalPayoutAmountPaise += netAmount;
    }

    return { createdPayoutsCount, totalPayoutAmountPaise };
  }

  /**
   * Generates GSTR-8 Section 52 Monthly TCS CSV Report for government filing.
   */
  async generateGSTR8ReportCSV(month: number, year: number): Promise<string> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const payouts = await prisma.payout.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        designer: { include: { businessVerification: true } },
      },
    });

    const headers = [
      "GSTIN of E-Commerce Operator",
      "Supplier GSTIN",
      "Supplier Trade Name",
      "Gross Supplies (INR)",
      "TCS Taxable Value (INR)",
      "Section 52 TCS Deducted (1%) (INR)",
    ];

    const rows = payouts.map((p) => {
      const gstin = p.designer.businessVerification?.gstin || "URP";
      const name = p.designer.name;
      const gross = (p.grossSales / 100).toFixed(2);
      const tcs = (p.totalTcsDeducted / 100).toFixed(2);

      return [`"07AAAAA0000A1Z5"`, `"${gstin}"`, `"${name}"`, gross, gross, tcs].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  /**
   * Generates NEFT Bank Transfer CSV File for manual bank upload.
   */
  async generateNEFTPayoutCSV(): Promise<string> {
    const pendingPayouts = await prisma.payout.findMany({
      where: { status: "pending" },
      include: {
        designer: { include: { businessVerification: true } },
      },
    });

    const headers = [
      "Beneficiary Name",
      "Account Number",
      "IFSC Code",
      "Net Payout Amount (INR)",
      "Payment Ref ID",
    ];

    const rows = pendingPayouts.map((p) => {
      const v = p.designer.businessVerification;
      const accName = v?.bankAccountName || p.designer.name;
      const accNo = v?.bankAccountNumber || "N/A";
      const ifsc = v?.bankIfsc || "N/A";
      const net = (p.netAmount / 100).toFixed(2);

      return [`"${accName}"`, `"${accNo}"`, `"${ifsc}"`, net, `"${p.id}"`].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }
}
