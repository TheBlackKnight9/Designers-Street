"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Download, Zap, CreditCard, X } from "lucide-react";

type PayoutBatch = {
  id: string;
  designerId: string;
  cycleStartDate: string;
  cycleEndDate: string;
  grossSales: number;
  totalCommission: number;
  totalCommissionGst: number;
  totalTcsDeducted: number;
  netAmount: number;
  bankUtrNumber?: string | null;
  status: string;
  designer?: {
    name: string;
  };
};

type PayoutMetrics = {
  totalGrossSales: number;
  totalCommission: number;
  totalTcs: number;
  totalNetPaid: number;
};

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutBatch[]>([]);
  const [metrics, setMetrics] = useState<PayoutMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  // UTR Modal state
  const [selectedPayout, setSelectedPayout] = useState<PayoutBatch | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);

  async function fetchPayouts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payouts");
      const body = await res.json();
      if (body?.ok && Array.isArray(body.data?.payouts)) {
        setPayouts(body.data.payouts);
        setMetrics(body.data.metrics || null);
      }
    } catch {
      alert("Failed to load payout ledger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayouts();
  }, []);

  async function executeBatch() {
    if (!confirm("Run settlement engine for 1st-15th or 16th-End cycle for all active houses?")) return;
    setExecuting(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_cycle" }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        alert(`Payout Batch generated successfully for ${data.data.createdCount} designer houses!`);
        await fetchPayouts();
      } else {
        alert(data?.error?.message || "Failed to execute payout batch");
      }
    } catch {
      alert("Error generating payout batch");
    } finally {
      setExecuting(false);
    }
  }

  function handleExportNeft() {
    const csvRows = [
      ["Beneficiary Name", "Account Number", "IFSC Code", "Net Amount (INR)", "Payment Ref / Batch ID"],
      ...payouts.map((p) => [
        p.designer?.name || "Designer House",
        `'${p.designerId.slice(-8)}`,
        "HDFC0001234",
        (p.netAmount / 100).toFixed(2),
        `PAY-${p.id.slice(-6)}`,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NEFT_Bank_Payout_File_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleExportGstr8() {
    const csvRows = [
      ["Merchant GSTIN", "Trade Name", "Gross Sales", "Platform Commission", "1% TCS (Sec 52)", "Net Payable"],
      ...payouts.map((p) => [
        "27AAAAA0000A1Z5",
        p.designer?.name || "Designer House",
        (p.grossSales / 100).toFixed(2),
        (p.totalCommission / 100).toFixed(2),
        (p.totalTcsDeducted / 100).toFixed(2),
        (p.netAmount / 100).toFixed(2),
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSTR8_Sec52_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleMarkPaidWithUTR(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPayout || !utrNumber.trim()) return;
    setSubmittingUtr(true);

    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_paid",
          payoutId: selectedPayout.id,
          utrNumber: utrNumber.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        alert(`Payout marked completed with UTR: ${utrNumber.trim()}`);
        setSelectedPayout(null);
        setUtrNumber("");
        await fetchPayouts();
      } else {
        alert(data?.error?.message || "Failed to finalize payout");
      }
    } catch {
      alert("Error completing payout");
    } finally {
      setSubmittingUtr(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-xs text-[#8A8A8A] font-bold animate-pulse">Loading payout ledger...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Payout Ledger & GST TCS"
        subtitle="Automated 1st & 15th cycle payouts, Sec 52 TCS, GSTR-8 exports & NEFT Bank transfers"
      />

      {/* Action Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportNeft}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#ECE8DC] text-[#1A1A1A] text-xs font-bold rounded-none shadow-2xs hover:bg-white/80"
          >
            <Download className="w-3.5 h-3.5" />
            <span>NEFT Bank CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportGstr8}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#ECE8DC] text-[#1A1A1A] text-xs font-bold rounded-none shadow-2xs hover:bg-white/80"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>GSTR-8 Report</span>
          </button>
        </div>

        <button
          type="button"
          disabled={executing}
          onClick={executeBatch}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F6D746] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-none shadow-2xs disabled:opacity-60 hover:bg-[#F6D746]/90 active:scale-95 cursor-pointer"
        >
          <Zap className="w-4 h-4 stroke-[2]" />
          {executing ? "Processing Batch…" : "Execute Payout Ledger"}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Gross Sales"
          value={formatPrice((metrics?.totalGrossSales || 0) / 100)}
          icon={<CreditCard className="w-5 h-5 stroke-[1.8]" />}
          badgeBg="bg-[#F4F0E5] text-[#1A1A1A]"
        />
        <AdminStatCard
          label="10% Platform Comm."
          value={formatPrice((metrics?.totalCommission || 0) / 100)}
          icon={<CreditCard className="w-5 h-5 stroke-[1.8]" />}
          badgeBg="bg-[#F6D746] text-[#1A1A1A]"
        />
        <AdminStatCard
          label="1% GST TCS (Sec 52)"
          value={formatPrice((metrics?.totalTcs || 0) / 100)}
          icon={<CreditCard className="w-5 h-5 stroke-[1.8]" />}
          badgeBg="bg-[#F3B383] text-[#1A1A1A]"
        />
        <AdminStatCard
          label="Net Paid to Designers"
          value={formatPrice((metrics?.totalNetPaid || 0) / 100)}
          icon={<CreditCard className="w-5 h-5 stroke-[1.8]" />}
          badgeBg="bg-[#A9E4B0] text-[#1A1A1A]"
        />
      </div>

      {/* Executed Payout Batches Table */}
      <div className="bg-white rounded-none border border-[#ECE8DC] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#ECE8DC] flex justify-between items-center bg-[#FAF8F5]">
          <h2 className="font-display text-sm font-bold uppercase text-[#1A1A1A]">
            Payout Ledger Batches
          </h2>
          <span className="text-xs font-mono font-bold text-[#8A8A8A]">
            Total Batches: {payouts.length}
          </span>
        </div>

        {payouts.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-[#8A8A8A]">
            No payout ledger batches generated yet. Click &quot;Execute Payout Ledger&quot; to run cycle.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECE8DC] text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] bg-[#FAF8F5]">
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Designer House</th>
                  <th className="py-3 px-4">Gross Sales</th>
                  <th className="py-3 px-4">10% Comm.</th>
                  <th className="py-3 px-4">18% GST</th>
                  <th className="py-3 px-4">1% TCS</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Bank UTR</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8DC]">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#1A1A1A]">
                      #{p.id.slice(-6)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-xs">
                      <Link href={`/admin/designers/${p.designerId}/analytics`} className="hover:underline text-[#1A1A1A]">
                        {p.designer?.name || "Designer House"}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#1A1A1A]">
                      {formatPrice(p.grossSales / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-red-600 font-medium">
                      -{formatPrice(p.totalCommission / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-red-600 font-medium">
                      -{formatPrice(p.totalCommissionGst / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-amber-700 font-medium">
                      -{formatPrice(p.totalTcsDeducted / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-700">
                      {formatPrice(p.netAmount / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#8A8A8A]">
                      {p.bankUtrNumber || "Pending"}
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminStatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status !== "completed" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayout(p);
                            setUtrNumber(p.bankUtrNumber || "");
                          }}
                          className="px-3.5 py-1.5 bg-[#F6D746] text-[#1A1A1A] text-[11px] font-bold uppercase rounded-none shadow-2xs hover:bg-[#F6D746]/90 cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enter UTR Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none p-6 max-w-md w-full space-y-4 shadow-xl border border-[#ECE8DC]">
            <div className="flex justify-between items-center border-b border-[#ECE8DC] pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A8A] block">
                  NEFT / Corporate Net Banking
                </span>
                <h3 className="font-display text-base font-bold uppercase text-[#1A1A1A]">
                  Finalize Payout #{selectedPayout.id.slice(-6)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
                className="w-7 h-7 rounded-none bg-[#F4F0E5] text-[#1A1A1A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F4F0E5]/60 p-4 rounded-none border border-[#ECE8DC] text-xs space-y-1">
              <p><strong>Beneficiary:</strong> {selectedPayout.designer?.name}</p>
              <p><strong>Net Amount:</strong> <span className="font-mono font-bold text-emerald-700">{formatPrice(selectedPayout.netAmount / 100)}</span></p>
            </div>

            <form onSubmit={handleMarkPaidWithUTR} className="space-y-3">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Bank UTR Reference Number *</span>
                <input
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. N214260018472"
                  className="mt-1 w-full rounded-none border border-[#ECE8DC] bg-[#F4F0E5] p-3 text-xs font-mono font-bold outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={submittingUtr}
                className="w-full py-3.5 bg-[#A9E4B0] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-none shadow-md hover:bg-[#A9E4B0]/90 disabled:opacity-60 cursor-pointer"
              >
                {submittingUtr ? "Finalizing Payout…" : "Confirm & Complete Payout →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
