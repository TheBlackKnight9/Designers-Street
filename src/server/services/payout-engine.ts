import { prisma } from "@/server/db";
import { FinancialAccountingEngine } from "./financial-accounting";

const accountingEngine = new FinancialAccountingEngine();

export class PayoutEngineService {
  /**
   * Executes bi-monthly payout calculation batch for 1st or 15th cycle.
   */
  async executeBiMonthlyPayoutBatch(): Promise<{
    createdPayoutsCount: number;
    totalPayoutAmountPaise: number;
  }> {
    const now = new Date();

    // Query eligible orders: status === 'delivered', no active dispute, payoutId === null
    const eligibleOrders = await prisma.order.findMany({
      where: {
        payoutId: null,
        status: "delivered",
        disputes: {
          none: { status: { in: ["open", "investigating"] } },
        },
      },
      include: {
        designer: true,
      },
    });

    // Group eligible orders by designer house
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
        const ledger = accountingEngine.calculateLedger({
          subtotal: order.subtotal,
          baseGarmentPrice: order.baseGarmentPrice || order.subtotal,
          builtInShippingFee: order.builtInShippingFee || order.shippingFee || 0,
          prepaidDiscountShare: order.prepaidDiscountShare || 0,
        });

        grossSales += (order.subtotal + (order.builtInShippingFee || 0));
        totalCommission += ledger.platformCommission;
        totalCommissionGst += ledger.commissionGst;
        totalTcsDeducted += ledger.tcsAmount;
        netAmount += ledger.designerNetPayable;
      }

      const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() <= 15 ? 1 : 16);
      const periodEnd = now;

      // Create Payout record in pending status for NEFT bank transfer
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
          status: "pending",
          method: "neft_manual",
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
   * Finalizes pending payout with Bank UTR reference string.
   */
  async finalizePayoutWithUTR(payoutId: string, utrNumber: string): Promise<any> {
    const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new Error("Payout not found");
    if (!utrNumber || utrNumber.trim().length < 4) {
      throw new Error("Valid Bank UTR reference string is required");
    }

    return prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: "completed",
        bankUtrNumber: utrNumber.trim(),
        paidAt: new Date(),
      },
    });
  }

  /**
   * Generates GSTR-8 Section 52 Monthly TCS CSV Report for government GST filing.
   */
  async generateGSTR8ReportCSV(month: number, year: number): Promise<string> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

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
      "Supplier Legal / Trade Name",
      "Supplier GSTIN / URP",
      "Gross Consideration (INR)",
      "Taxable Value (INR)",
      "Section 52 TCS Deducted (1%) (INR)",
    ];

    const rows = payouts.map((p) => {
      const gstin = p.designer.gstin || p.designer.businessVerification?.gstin || "URP";
      const name = p.designer.name;
      const gross = (p.grossSales / 100).toFixed(2);
      const tcs = (p.totalTcsDeducted / 100).toFixed(2);

      return [`"07AAAAA0000A1Z5"`, `"${name}"`, `"${gstin}"`, gross, gross, tcs].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  /**
   * Generates NEFT Bank Transfer CSV File for corporate net banking bulk upload.
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
      "Bank Account Number",
      "IFSC Code",
      "Net Payout Amount (INR)",
      "Payment Ref / Payout ID",
    ];

    const rows = pendingPayouts.map((p) => {
      const v = p.designer.businessVerification;
      const accName = p.designer.bankBeneficiary || v?.bankAccountName || p.designer.name;
      const accNo = p.designer.bankAccount || v?.bankAccountNumber || "N/A";
      const ifsc = p.designer.bankIfsc || v?.bankIfsc || "N/A";
      const net = (p.netAmount / 100).toFixed(2);

      return [`"${accName}"`, `"${accNo}"`, `"${ifsc}"`, net, `"${p.id}"`].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }
}
