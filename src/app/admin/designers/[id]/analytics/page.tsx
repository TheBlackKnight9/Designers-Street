"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  ArrowLeft,
  DollarSign,
  Truck,
  Percent,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" />
          <p className="text-xs font-medium text-zinc-500">Loading house financial ledger...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center rounded-xl border border-zinc-200 bg-white">
        <p className="text-sm font-semibold text-zinc-950">Designer analytics not found</p>
        <Link href="/admin/payouts" className="text-xs font-medium text-zinc-600 hover:text-zinc-950 mt-2 inline-block">
          ← Back to Payout Ledger
        </Link>
      </div>
    );
  }

  const { designer, summary, orders } = data;

  return (
    <div className="space-y-6 font-sans">
      {/* Back Link */}
      <div>
        <Link
          href="/admin/payouts"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Payout Ledger</span>
        </Link>
      </div>

      {/* Top Header Bar */}
      <AdminTopBar
        title={`Financial Ledger: ${designer.name}`}
        subtitle={`Handle: @${designer.handle} · GSTIN: ${designer.gstin || "URP (Unregistered)"} · Bank IFSC: ${designer.bankIfsc || "Pending"}`}
        actionButton={{
          label: "View Public Store",
          href: `/designers/${designer.handle}`,
          icon: ExternalLink,
        }}
      />

      {/* Financial Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <AdminStatCard
          label="Gross Revenue"
          value={formatPrice(summary.totalGrossSales)}
          icon={<DollarSign className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="Base Garment Value"
          value={formatPrice(summary.totalBaseGarment)}
          icon={<Receipt className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="Shipping Fees"
          value={formatPrice(summary.totalShippingFee)}
          icon={<Truck className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="10% Commission"
          value={`-${formatPrice(summary.totalPlatformCommission)}`}
          icon={<Percent className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="1% TCS (Sec 52)"
          value={`-${formatPrice(summary.totalTcs)}`}
          icon={<FileSpreadsheet className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="Total Net Payable"
          value={formatPrice(summary.totalNetPayable)}
          icon={<CheckCircle2 className="w-4 h-4 text-zinc-950" />}
          badgeBg="bg-zinc-950 text-white"
        />
        <AdminStatCard
          label="Settled & Disbursed"
          value={formatPrice(summary.netPaid)}
          icon={<CheckCircle2 className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="Pending Escrow Hold"
          value={formatPrice(summary.netPending)}
          icon={<Clock className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
      </div>

      {/* Orders Breakdown Table */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-950">
            Order-Level Financial Settlements
          </h2>
          <span className="text-xs font-mono font-medium text-zinc-500">
            {orders.length} order(s)
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            No sales or orders recorded for this designer house yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/75 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Base Garment</th>
                  <th className="py-3 px-4 font-semibold text-right">Shipping</th>
                  <th className="py-3 px-4 font-semibold text-right">10% Comm.</th>
                  <th className="py-3 px-4 font-semibold text-right">1% TCS</th>
                  <th className="py-3 px-4 font-semibold text-right">Designer Net</th>
                  <th className="py-3 px-4 font-semibold text-right">Tax Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 text-xs">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-900">
                      #{ord.id.slice(-6)}
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminStatusBadge status={ord.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right font-medium text-zinc-900">
                      {formatPrice((ord.baseGarmentPrice || ord.subtotal) / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-zinc-600">
                      +{formatPrice((ord.builtInShippingFee || 0) / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-zinc-600">
                      -{formatPrice((ord.platformCommission || 0) / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-zinc-600">
                      -{formatPrice((ord.tcsDeducted || 0) / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right font-semibold text-zinc-950">
                      {formatPrice((ord.designerNetPayable || 0) / 100)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/api/orders/${ord.id}/invoice`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-950 px-2.5 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                      >
                        <span>PDF</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
