"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  Download,
  Zap,
  CreditCard,
  X,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");

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
    if (!confirm("Run settlement engine for 1st-15th or 16th-End cycle for all active designer houses?")) return;
    setExecuting(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_cycle" }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        alert(`Payout batch generated successfully for ${data.data.createdCount} designer houses.`);
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

  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      const matchesSearch =
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.designer?.name && p.designer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.bankUtrNumber && p.bankUtrNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ? true : statusFilter === "completed" ? p.status === "completed" : p.status !== "completed";

      return matchesSearch && matchesStatus;
    });
  }, [payouts, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" />
          <p className="text-xs font-medium text-zinc-500">Loading payout ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Payout Ledger & GST TCS"
        subtitle="Automated 1st & 15th settlement cycles, Sec 52 TCS compliance, and NEFT bank transfers"
        actionButton={{
          label: executing ? "Executing Batch..." : "Run Settlement Cycle",
          onClick: executeBatch,
          icon: Zap,
        }}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Gross Sales"
          value={formatPrice((metrics?.totalGrossSales || 0) / 100)}
          icon={<CreditCard className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="10% Platform Comm."
          value={formatPrice((metrics?.totalCommission || 0) / 100)}
          icon={<Receipt className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="1% GST TCS (Sec 52)"
          value={formatPrice((metrics?.totalTcs || 0) / 100)}
          icon={<FileSpreadsheet className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="Net Disbursed"
          value={formatPrice((metrics?.totalNetPaid || 0) / 100)}
          icon={<CheckCircle2 className="w-4 h-4 text-zinc-900" />}
          badgeBg="bg-zinc-950 text-white"
        />
      </div>

      {/* Main Ledger Section */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {/* Controls header */}
        <div className="p-4 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === "all" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                All Batches ({payouts.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === "completed" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                Completed
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === "pending" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                Pending
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search house, batch ID, or UTR..."
                className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg w-56 sm:w-64 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportNeft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg hover:bg-zinc-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>NEFT CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportGstr8}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg hover:bg-zinc-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>GSTR-8 Report</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {filteredPayouts.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            {payouts.length === 0
              ? "No settlement batches generated yet. Click \"Run Settlement Cycle\" to compute current settlements."
              : "No payout batches match your search criteria."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/75 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Batch ID</th>
                  <th className="py-3 px-4 font-semibold">Designer House</th>
                  <th className="py-3 px-4 font-semibold text-right">Gross Sales</th>
                  <th className="py-3 px-4 font-semibold text-right">10% Comm.</th>
                  <th className="py-3 px-4 font-semibold text-right">18% GST</th>
                  <th className="py-3 px-4 font-semibold text-right">1% TCS</th>
                  <th className="py-3 px-4 font-semibold text-right">Net Payout</th>
                  <th className="py-3 px-4 font-semibold">Bank UTR</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 text-xs">
                {filteredPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-900">
                      #{p.id.slice(-6)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/designers/${p.designerId}/analytics`}
                        className="font-medium text-zinc-900 hover:text-zinc-600 inline-flex items-center gap-1 group"
                      >
                        <span>{p.designer?.name || "Designer House"}</span>
                        <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 transition-transform" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right font-medium text-zinc-900">
                      {formatPrice(p.grossSales / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-zinc-600">
                      -{formatPrice(p.totalCommission / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-zinc-600">
                      -{formatPrice(p.totalCommissionGst / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-zinc-600">
                      -{formatPrice(p.totalTcsDeducted / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right font-semibold text-zinc-950">
                      {formatPrice(p.netAmount / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-500">
                      {p.bankUtrNumber ? (
                        <span className="text-zinc-800 font-medium">{p.bankUtrNumber}</span>
                      ) : (
                        <span className="text-zinc-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminStatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status !== "completed" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayout(p);
                            setUtrNumber(p.bankUtrNumber || "");
                          }}
                          className="px-3 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-medium rounded-lg shadow-2xs transition-colors"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />
                          Settled
                        </span>
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                  NEFT / Net Banking Settlement
                </span>
                <h3 className="text-base font-semibold text-zinc-950">
                  Finalize Payout #{selectedPayout.id.slice(-6)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
                className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/70 text-xs space-y-1.5 text-zinc-700">
              <div className="flex justify-between">
                <span className="text-zinc-500">Beneficiary:</span>
                <span className="font-semibold text-zinc-900">{selectedPayout.designer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Net Payable Amount:</span>
                <span className="font-mono font-bold text-zinc-950 text-sm">
                  {formatPrice(selectedPayout.netAmount / 100)}
                </span>
              </div>
            </div>

            <form onSubmit={handleMarkPaidWithUTR} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Bank UTR Reference Number <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. N214260018472"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-mono font-medium text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Provided by your corporate banking portal upon successful NEFT transfer.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUtr}
                  className="px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {submittingUtr ? "Recording Settlement..." : "Confirm & Mark Settled"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
