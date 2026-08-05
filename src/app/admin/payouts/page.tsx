"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Download, Zap, X, CreditCard } from "lucide-react";

type Payout = {
  id: string;
  designerId: string;
  grossSales: number;
  totalCommission: number;
  totalCommissionGst: number;
  totalTcsDeducted: number;
  netAmount: number;
  status: string;
  method: string;
  bankUtrNumber?: string | null;
  paidAt: string | null;
  createdAt: string;
  designer?: { name: string; handle: string };
};

type Metrics = {
  totalGrossSales: number;
  totalCommission: number;
  totalTcs: number;
  totalNetPaid: number;
  payoutsCount: number;
};

export default function AdminPayoutsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  // UTR Modal state
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);

  async function fetchPayouts() {
    try {
      const res = await fetch("/api/admin/payouts");
      const body = await res.json();
      if (body?.ok && body.data) {
        setMetrics(body.data.metrics);
        setPayouts(body.data.payouts);
      }
    } catch {
      /* error */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayouts();
  }, []);

  async function executeBatch() {
    setExecuting(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute_batch" }),
      });
      const data = await res.json();
      if (data?.ok) {
        alert(`Payout Batch Executed! ${data.data?.createdPayoutsCount || 0} designer payout calculation ledgers created.`);
        await fetchPayouts();
      }
    } catch {
      alert("Error executing payout batch");
    } finally {
      setExecuting(false);
    }
  }

  async function handleExportNeft() {
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export_neft" }),
      });
      const csv = await res.text();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NEFT_Bank_Bulk_Upload_${Date.now()}.csv`;
      a.click();
    } catch {
      alert("Error exporting NEFT CSV");
    }
  }

  async function handleExportGstr8() {
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export_gstr8" }),
      });
      const csv = await res.text();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GSTR8_Section52_TCS_${Date.now()}.csv`;
      a.click();
    } catch {
      alert("Error exporting GSTR-8 report");
    }
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#ECE8DC] text-[#1A1A1A] text-xs font-bold rounded-full shadow-2xs hover:bg-white/80"
          >
            <Download className="w-3.5 h-3.5" />
            <span>NEFT Bank CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportGstr8}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#ECE8DC] text-[#1A1A1A] text-xs font-bold rounded-full shadow-2xs hover:bg-white/80"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>GSTR-8 Report</span>
          </button>
        </div>

        <button
          type="button"
          disabled={executing}
          onClick={executeBatch}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F6D746] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-full shadow-2xs disabled:opacity-60 hover:bg-[#F6D746]/90 active:scale-95 cursor-pointer"
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
      <div className="bg-white rounded-2xl border border-[#ECE8DC] overflow-hidden shadow-2xs">
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
                          className="px-3.5 py-1.5 bg-[#F6D746] text-[#1A1A1A] text-[11px] font-bold uppercase rounded-full shadow-2xs hover:bg-[#F6D746]/90 cursor-pointer"
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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#ECE8DC]">
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
                className="w-7 h-7 rounded-full bg-[#F4F0E5] text-[#1A1A1A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F4F0E5]/60 p-4 rounded-xl border border-[#ECE8DC] text-xs space-y-1">
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
                  className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] p-3 text-xs font-mono font-bold outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={submittingUtr}
                className="w-full py-3.5 bg-[#A9E4B0] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-[#A9E4B0]/90 disabled:opacity-60 cursor-pointer"
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
