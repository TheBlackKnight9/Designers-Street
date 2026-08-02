"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";

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
    return <div className="py-12 text-center text-sm text-stone animate-pulse">Loading payout management...</div>;
  }

  return (
    <main className="min-h-screen bg-paper pb-24 px-4 pt-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-xs font-bold text-stone hover:text-charcoal">
            ← Admin Console
          </Link>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal mt-1">
            Bi-Monthly Payout Ledger &amp; GST TCS Manager
          </h1>
          <p className="text-xs text-stone mt-0.5">
            Automated 1st &amp; 15th cycle payout ledger, 1% Section 52 TCS, GSTR-8 exports &amp; NEFT Bank transfers
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportNeft}
            className="px-4 py-2.5 bg-white text-stone border border-cloud font-sans text-xs font-bold uppercase rounded-full shadow-xs hover:bg-mist"
          >
            📥 Export NEFT CSV
          </button>
          <button
            type="button"
            onClick={handleExportGstr8}
            className="px-4 py-2.5 bg-white text-stone border border-cloud font-sans text-xs font-bold uppercase rounded-full shadow-xs hover:bg-mist"
          >
            📊 Export GSTR-8 Report
          </button>
          <button
            type="button"
            disabled={executing}
            onClick={executeBatch}
            className="px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-xs disabled:opacity-60 hover:bg-black"
          >
            {executing ? "Processing Batch…" : "⚡ Execute 1st / 15th Payout Ledger"}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">Total Platform Gross Sales</span>
          <p className="font-mono text-xl font-bold text-charcoal">{formatPrice((metrics?.totalGrossSales || 0) / 100)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">10% Platform Commission</span>
          <p className="font-mono text-xl font-bold text-emerald-800">{formatPrice((metrics?.totalCommission || 0) / 100)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">1% GST TCS (Sec 52)</span>
          <p className="font-mono text-xl font-bold text-amber-700">{formatPrice((metrics?.totalTcs || 0) / 100)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">Total Net Paid to Designers</span>
          <p className="font-mono text-xl font-bold text-charcoal">{formatPrice((metrics?.totalNetPaid || 0) / 100)}</p>
        </div>
      </div>

      {/* Executed Payout Batches Table */}
      <div className="bg-white rounded-3xl border border-cloud shadow-xs overflow-hidden">
        <div className="p-5 border-b border-cloud flex justify-between items-center">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">Bi-Monthly Payout Ledger Batches</h2>
          <span className="text-xs font-mono font-bold text-stone">Total Batches: {payouts.length}</span>
        </div>

        {payouts.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone">No payout ledger batches generated yet. Click &quot;Execute Payout Ledger&quot; to run cycle.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-mist text-[10px] font-bold uppercase tracking-wider text-stone border-b border-cloud">
                <tr>
                  <th className="p-3.5">Batch ID</th>
                  <th className="p-3.5">Designer House</th>
                  <th className="p-3.5">Gross Sales</th>
                  <th className="p-3.5">10% Comm.</th>
                  <th className="p-3.5">18% GST (Comm)</th>
                  <th className="p-3.5">1% TCS</th>
                  <th className="p-3.5">Net Payout</th>
                  <th className="p-3.5">Bank UTR</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud text-charcoal">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-mist/30">
                    <td className="p-3.5 font-mono font-bold text-stone">#{p.id.slice(-6)}</td>
                    <td className="p-3.5 font-bold">
                      <Link href={`/admin/designers/${p.designerId}/analytics`} className="underline hover:text-black">
                        {p.designer?.name || "Designer House"}
                      </Link>
                    </td>
                    <td className="p-3.5 font-mono">{formatPrice(p.grossSales / 100)}</td>
                    <td className="p-3.5 font-mono text-red-700">-{formatPrice(p.totalCommission / 100)}</td>
                    <td className="p-3.5 font-mono text-red-600">-{formatPrice(p.totalCommissionGst / 100)}</td>
                    <td className="p-3.5 font-mono text-amber-700">-{formatPrice(p.totalTcsDeducted / 100)}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-800">{formatPrice(p.netAmount / 100)}</td>
                    <td className="p-3.5 font-mono text-[11px] text-stone">
                      {p.bankUtrNumber || "Pending Transfer"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                          p.status === "completed"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {p.status !== "completed" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayout(p);
                            setUtrNumber(p.bankUtrNumber || "");
                          }}
                          className="px-3 py-1.5 bg-charcoal text-paper font-sans text-[10px] font-bold uppercase rounded-full shadow-xs hover:bg-black"
                        >
                          Enter UTR / Mark Paid
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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-cloud pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone block">NEFT / RTGS Corporate Net Banking</span>
                <h3 className="font-display text-base font-bold uppercase text-charcoal">
                  Finalize Payout #{selectedPayout.id.slice(-6)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
                className="text-xs font-bold text-stone hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <div className="bg-mist/50 p-4 rounded-2xl border border-cloud text-xs space-y-1">
              <p><strong>Beneficiary:</strong> {selectedPayout.designer?.name}</p>
              <p><strong>Net Amount:</strong> <span className="font-mono font-bold text-emerald-800">{formatPrice(selectedPayout.netAmount / 100)}</span></p>
            </div>

            <form onSubmit={handleMarkPaidWithUTR} className="space-y-3">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Bank Transaction Reference / UTR Number *</span>
                <input
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. N214260018472"
                  className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs font-mono font-bold outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={submittingUtr}
                className="w-full py-3.5 bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-emerald-800 disabled:opacity-60"
              >
                {submittingUtr ? "Finalizing Payout…" : "Confirm & Complete Payout →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
