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
  paidAt: string | null;
  createdAt: string;
  designer?: { name: string };
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
        alert(`Payout Batch Executed! ${data.data?.createdPayoutsCount || 0} designer payouts generated.`);
        await fetchPayouts();
      }
    } catch {
      alert("Error executing payout batch");
    } finally {
      setExecuting(false);
    }
  }

  async function exportGSTR8() {
    window.open("/api/admin/payouts?export=gstr8", "_blank");
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-stone animate-pulse">Loading payout management...</div>;
  }

  return (
    <main className="min-h-screen bg-paper pb-24 px-4 pt-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-xs font-bold text-stone hover:text-charcoal">
            ← Admin Console
          </Link>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal mt-1">
            Bi-Monthly Payouts &amp; GST TCS Manager
          </h1>
          <p className="text-xs text-stone mt-0.5">
            Automated 1st &amp; 15th cycle payout settlement, Section 52 GSTR-8 filing &amp; NEFT exports
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={executing}
            onClick={executeBatch}
            className="px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase rounded-full shadow-xs disabled:opacity-60 hover:bg-black"
          >
            {executing ? "Processing Batch…" : "Execute 1st / 15th Batch Now"}
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
          <span className="text-[10px] font-bold uppercase text-stone">Platform Commission Earned</span>
          <p className="font-mono text-xl font-bold text-emerald-800">{formatPrice((metrics?.totalCommission || 0) / 100)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">1% TCS Collected (Sec 52)</span>
          <p className="font-mono text-xl font-bold text-amber-700">{formatPrice((metrics?.totalTcs || 0) / 100)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cloud space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-stone">Net Paid to Designers</span>
          <p className="font-mono text-xl font-bold text-charcoal">{formatPrice((metrics?.totalNetPaid || 0) / 100)}</p>
        </div>
      </div>

      {/* Executed Payout Batches Table */}
      <div className="bg-white rounded-3xl border border-cloud shadow-xs overflow-hidden">
        <div className="p-5 border-b border-cloud flex justify-between items-center">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">Historical Payout Batches</h2>
          <span className="text-xs font-mono font-bold text-stone">Total: {payouts.length}</span>
        </div>

        {payouts.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone">No payout batches generated yet. Click &quot;Execute Batch&quot; to run cycle.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-mist text-[10px] font-bold uppercase tracking-wider text-stone border-b border-cloud">
                <tr>
                  <th className="p-3.5">Batch ID</th>
                  <th className="p-3.5">Designer</th>
                  <th className="p-3.5">Gross Sales</th>
                  <th className="p-3.5">15% Comm.</th>
                  <th className="p-3.5">1% TCS</th>
                  <th className="p-3.5">Net Payout</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud text-charcoal">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-mist/30">
                    <td className="p-3.5 font-mono font-bold text-stone">#{p.id.slice(-6)}</td>
                    <td className="p-3.5 font-bold">{p.designer?.name || "Designer House"}</td>
                    <td className="p-3.5 font-mono">{formatPrice(p.grossSales / 100)}</td>
                    <td className="p-3.5 font-mono text-red-700">-{formatPrice(p.totalCommission / 100)}</td>
                    <td className="p-3.5 font-mono text-amber-700">-{formatPrice(p.totalTcsDeducted / 100)}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-800">{formatPrice(p.netAmount / 100)}</td>
                    <td className="p-3.5 uppercase font-mono text-[10px]">{p.method}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-900">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
