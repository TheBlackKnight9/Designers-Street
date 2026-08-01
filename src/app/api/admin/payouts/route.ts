import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { PayoutEngineService } from "@/server/services/payout-engine";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";
const payoutEngine = new PayoutEngineService();

/** GET /api/admin/payouts */
export async function GET() {
  try {
    const payouts = await prisma.payout.findMany({
      include: {
        designer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    let totalGrossSales = 0;
    let totalCommission = 0;
    let totalTcs = 0;
    let totalNetPaid = 0;

    for (const p of payouts) {
      totalGrossSales += p.grossSales;
      totalCommission += p.totalCommission;
      totalTcs += p.totalTcsDeducted;
      totalNetPaid += p.netAmount;
    }

    return ok({
      metrics: {
        totalGrossSales,
        totalCommission,
        totalTcs,
        totalNetPaid,
        payoutsCount: payouts.length,
      },
      payouts,
    });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/admin/payouts */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action || "").toLowerCase();

    if (action === "execute_batch") {
      const result = await payoutEngine.executeBiMonthlyPayoutBatch();
      return ok({ message: "Bi-monthly payout batch executed successfully.", ...result });
    }

    if (action === "export_neft") {
      const csv = await payoutEngine.generateNEFTPayoutCSV();
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="NEFT_Payouts_${Date.now()}.csv"`,
        },
      });
    }

    if (action === "export_gstr8") {
      const month = Number(body.month || new Date().getMonth() + 1);
      const year = Number(body.year || new Date().getFullYear());
      const csv = await payoutEngine.generateGSTR8ReportCSV(month, year);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="GSTR8_Section52_TCS_${month}_${year}.csv"`,
        },
      });
    }

    return ok({ message: "No action performed" });
  } catch (error) {
    return fail(error);
  }
}
