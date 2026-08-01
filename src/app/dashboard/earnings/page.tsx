"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/mock-data";
import { useToast } from "@/components/dashboard/Toast";

type LedgerItem = {
  id: string;
  createdAt: string;
  status: string;
  payoutStatus: string;
  subtotal: number;
  shippingFee: number;
  grossTotal: number;
  platformCommission: number;
  commissionGst: number;
  tcsDeducted: number;
  designerNetEarnings: number;
};

type Metrics = {
  grossSalesMonth: number;
  netEarningsMonth: number;
  clearanceHoldAmount: number;
  nextPayoutDate: string;
};

export default function DesignerEarningsPage() {
  const { push } = useToast();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/earnings")
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok && body.data) {
          setMetrics(body.data.metrics);
          setLedger(body.data.ledger);
        }
      })
      .catch(() => push("Failed to load earnings ledger", "err"))
      .finally(() => setLoading(false));
  }, []);

  function downloadStatementCSV() {
    if (ledger.length === 0) return;
    const headers = ["Order ID", "Date", "Gross Sales", "15% Commission", "18% GST on Commission", "1% TCS Sec 52", "Net Earnings", "Status"];
    const rows = ledger.map((l) => [
      `"${l.id.slice(-8)}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
      `"${(l.grossTotal / 100).toFixed(2)}"`,
      `"${(l.platformCommission / 100).toFixed(2)}"`,
      `"${(l.commissionGst / 100).toFixed(2)}"`,
      `"${(l.tcsDeducted / 100).toFixed(2)}"`,
      `"${(l.designerNetEarnings / 100).toFixed(2)}"`,
      `"${l.payoutStatus}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tax_Statement_${new Date().toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-stone animate-pulse">Loading financial ledger...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Earnings &amp; Settlements
          </h1>
          <p className="text-xs text-stone mt-1">
            Bi-monthly payout settlements (1st &amp; 15th), 15% commission, 18% GST &amp; 1% TCS Sec 52 breakdown
          </p>
        </div>

        <button
          type="button"
          onClick={downloadStatementCSV}
          className="px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-black"
        >
          Download Tax Statement (CSV) ↓
        </button>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-cloud shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">Gross Sales (This Month)</span>
          <p className="font-mono text-xl font-bold text-charcoal">{formatPrice((metrics?.grossSalesMonth || 0) / 100)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">Net Earnings (This Month)</span>
          <p className="font-mono text-xl font-bold text-emerald-800">{formatPrice((metrics?.netEarningsMonth || 0) / 100)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">Clearance Hold</span>
          <p className="font-mono text-xl font-bold text-amber-700">{formatPrice((metrics?.clearanceHoldAmount || 0) / 100)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">Next Bi-Monthly Cycle</span>
          <p className="font-mono text-base font-bold text-charcoal">
            {metrics?.nextPayoutDate ? new Date(metrics.nextPayoutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "1st / 15th"}
          </p>
        </div>
      </div>

      {/* Settlement Ledger Table */}
      <div className="bg-white rounded-3xl border border-cloud shadow-xs overflow-hidden">
        <div className="p-5 border-b border-cloud">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">Financial Settlement Ledger</h2>
        </div>

        {ledger.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone">No financial settlements recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-mist text-[10px] font-bold uppercase tracking-wider text-stone border-b border-cloud">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Gross Sales</th>
                  <th className="p-3.5">15% Comm.</th>
                  <th className="p-3.5">18% GST</th>
                  <th className="p-3.5">1% TCS</th>
                  <th className="p-3.5">Net Payout</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud text-charcoal">
                {ledger.map((l) => (
                  <tr key={l.id} className="hover:bg-mist/30">
                    <td className="p-3.5 font-mono font-bold text-stone">#{l.id.slice(-6)}</td>
                    <td className="p-3.5 font-mono font-bold">{formatPrice(l.grossTotal / 100)}</td>
                    <td className="p-3.5 font-mono text-red-700">-{formatPrice(l.platformCommission / 100)}</td>
                    <td className="p-3.5 font-mono text-red-700">-{formatPrice(l.commissionGst / 100)}</td>
                    <td className="p-3.5 font-mono text-amber-700">-{formatPrice(l.tcsDeducted / 100)}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-800">{formatPrice(l.designerNetEarnings / 100)}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md ${
                        l.payoutStatus === "Paid" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                      }`}>
                        {l.payoutStatus}
                      </span>
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
