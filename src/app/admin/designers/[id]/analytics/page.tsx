"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";

type AnalyticsData = {
  designer: {
    id: string;
    name: string;
    handle: string;
    logo?: string | null;
    gstin?: string | null;
    bankAccount?: string | null;
    bankIfsc?: string | null;
  };
  summary: {
    totalGrossSales: number;
    totalBaseGarment: number;
    totalShippingFee: number;
    totalPlatformCommission: number;
    totalTcs: number;
    totalNetPayable: number;
    netPaid: number;
    netPending: number;
    totalOrdersCount: number;
  };
  orders: Array<{
    id: string;
    status: string;
    subtotal: number;
    baseGarmentPrice: number;
    builtInShippingFee: number;
    platformCommission: number;
    gstAmount: number;
    tcsDeducted: number;
    designerNetPayable: number;
    createdAt: string;
    items: Array<{ name: string; quantity: number }>;
  }>;
};

export default function DesignerAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/designers/${id}/analytics`)
      .then((r) => r.json())
      .then((res) => {
        if (res?.ok && res.data) {
          setData(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-12 text-center text-sm text-stone animate-pulse">Loading designer payment analytics...</div>;
  }

  if (!data) {
    return <div className="py-12 text-center text-sm text-stone">Designer analytics not found</div>;
  }

  const { designer, summary, orders } = data;

  return (
    <main className="min-h-screen bg-paper pb-24 px-4 pt-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/admin/payouts" className="text-xs font-bold text-stone hover:text-charcoal">
          ← Back to Payout Ledger
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
              Financial Analytics: {designer.name}
            </h1>
            <p className="text-xs text-stone mt-0.5 font-mono">
              Handle: @{designer.handle} · GSTIN: {designer.gstin || "URP"}
            </p>
          </div>
          <span className="px-3 py-1 bg-charcoal text-paper text-xs font-mono font-bold rounded-full">
            {summary.totalOrdersCount} Orders
          </span>
        </div>
      </div>

      {/* Financial Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">Total Gross Revenue</span>
          <p className="font-mono text-xl font-bold text-charcoal">{formatPrice(summary.totalGrossSales)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">Base Garment Revenue</span>
          <p className="font-mono text-xl font-bold text-charcoal">{formatPrice(summary.totalBaseGarment)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">Shipping Fees Collected</span>
          <p className="font-mono text-xl font-bold text-emerald-800">{formatPrice(summary.totalShippingFee)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">10% Platform Commission</span>
          <p className="font-mono text-xl font-bold text-red-700">-{formatPrice(summary.totalPlatformCommission)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">1% GST TCS (Sec 52)</span>
          <p className="font-mono text-xl font-bold text-amber-700">-{formatPrice(summary.totalTcs)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">Total Net Payable</span>
          <p className="font-mono text-xl font-bold text-emerald-900">{formatPrice(summary.totalNetPayable)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">Net Paid (Completed)</span>
          <p className="font-mono text-xl font-bold text-blue-900">{formatPrice(summary.netPaid)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">Net Pending (Unsettled)</span>
          <p className="font-mono text-xl font-bold text-amber-900">{formatPrice(summary.netPending)}</p>
        </div>
      </div>

      {/* Orders Breakdown Table */}
      <div className="bg-white rounded-3xl border border-cloud shadow-xs overflow-hidden">
        <div className="p-5 border-b border-cloud">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">Sub-Order Financial Breakdown</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-mist text-[10px] font-bold uppercase tracking-wider text-stone border-b border-cloud">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Base Garment</th>
                <th className="p-3.5">Shipping Fee</th>
                <th className="p-3.5">10% Comm.</th>
                <th className="p-3.5">1% TCS</th>
                <th className="p-3.5">Designer Net</th>
                <th className="p-3.5 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud text-charcoal font-medium">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-mist/30">
                  <td className="p-3.5 font-mono font-bold">#{ord.id.slice(-6)}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-mist text-charcoal">
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono">{formatPrice((ord.baseGarmentPrice || ord.subtotal) / 100)}</td>
                  <td className="p-3.5 font-mono text-emerald-800">+{formatPrice((ord.builtInShippingFee || 0) / 100)}</td>
                  <td className="p-3.5 font-mono text-red-700">-{formatPrice((ord.platformCommission || 0) / 100)}</td>
                  <td className="p-3.5 font-mono text-amber-700">-{formatPrice((ord.tcsDeducted || 0) / 100)}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-900">
                    {formatPrice((ord.designerNetPayable || 0) / 100)}
                  </td>
                  <td className="p-3.5 text-right">
                    <a
                      href={`/api/orders/${ord.id}/invoice`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-mist text-charcoal font-sans text-[10px] font-bold uppercase rounded-full border border-cloud hover:bg-cloud"
                    >
                      PDF Invoice ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
