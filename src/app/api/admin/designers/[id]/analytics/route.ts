import { prisma } from "@/server/db";
import { requireAdminContext } from "@/server/auth/admin-guard";
import { ok, fail } from "@/server/utils/api-response";
import { NotFoundError } from "@/server/errors";

export const runtime = "nodejs";

/** GET /api/admin/designers/[id]/analytics - Financial Ledger & Order Analytics per Designer House */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminContext();
    const { id } = await params;

    const designer = await prisma.designerHouse.findUnique({
      where: { id },
      include: { businessVerification: true },
    });

    if (!designer) throw new NotFoundError("Designer House not found");

    const orders = await prisma.order.findMany({
      where: { designerId: id },
      include: { items: true, disputes: true },
      orderBy: { createdAt: "desc" },
    });

    const payouts = await prisma.payout.findMany({
      where: { designerId: id },
      orderBy: { createdAt: "desc" },
    });

    let totalGrossSalesPaise = 0;
    let totalBaseGarmentPaise = 0;
    let totalShippingFeePaise = 0;
    let totalPlatformCommissionPaise = 0;
    let totalTcsPaise = 0;
    let totalNetPayablePaise = 0;

    for (const ord of orders) {
      if (ord.status !== "cancelled") {
        totalGrossSalesPaise += (ord.subtotal + (ord.builtInShippingFee || 0));
        totalBaseGarmentPaise += ord.baseGarmentPrice || ord.subtotal;
        totalShippingFeePaise += ord.builtInShippingFee || 0;
        totalPlatformCommissionPaise += ord.platformCommission || 0;
        totalTcsPaise += ord.tcsDeducted || 0;
        totalNetPayablePaise += ord.designerNetPayable || ord.designerNetEarnings || 0;
      }
    }

    let netPaidPaise = 0;
    let netPendingPaise = 0;

    for (const p of payouts) {
      if (p.status === "completed") {
        netPaidPaise += p.netAmount;
      } else {
        netPendingPaise += p.netAmount;
      }
    }

    return ok({
      designer,
      summary: {
        totalGrossSales: totalGrossSalesPaise / 100,
        totalBaseGarment: totalBaseGarmentPaise / 100,
        totalShippingFee: totalShippingFeePaise / 100,
        totalPlatformCommission: totalPlatformCommissionPaise / 100,
        totalTcs: totalTcsPaise / 100,
        totalNetPayable: totalNetPayablePaise / 100,
        netPaid: netPaidPaise / 100,
        netPending: netPendingPaise / 100,
        totalOrdersCount: orders.length,
      },
      orders,
      payouts,
    });
  } catch (error) {
    return fail(error);
  }
}
