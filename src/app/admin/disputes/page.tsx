"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/dashboard/Toast";
import { formatPrice } from "@/lib/mock-data";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Check, RotateCcw, AlertTriangle } from "lucide-react";

type Dispute = {
  id: string;
  orderId: string;
  buyerReason: string;
  description?: string | null;
  status: "open" | "investigating" | "resolved";
  resolution?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  order: {
    id: string;
    total: number;
    courierName?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    user: { name: string | null; email: string };
    designer: { name: string; handle: string } | null;
    items: Array<{ name: string; size: string; quantity: number }>;
  };
};

export default function AdminDisputesPage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  async function fetchDisputes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/disputes");
      const data = await res.json();
      if (data?.ok) {
        setDisputes(data.data.disputes);
      } else {
        push(data?.error?.message || "Failed to fetch disputes", "err");
      }
    } catch {
      push("Error fetching disputes", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDisputes();
  }, []);

  async function handleResolve(disputeId: string, resolution: "delivered_confirmed" | "refunded") {
    setResolvingId(disputeId);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        push(
          resolution === "delivered_confirmed"
            ? "Dispute resolved! Order unfrozen for payout."
            : "Buyer refunded & order payout cancelled.",
          "ok"
        );
        setAdminNotes("");
        fetchDisputes();
      } else {
        push(data?.error?.message || "Failed to resolve dispute", "err");
      }
    } catch {
      push("Error resolving dispute", "err");
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Buyer Dispute Protection & Hold Desk"
        subtitle="Review non-delivery claims, verify courier tracking logs, unfreeze valid payouts, or issue buyer refunds"
      />

      {loading ? (
        <div className="space-y-3">
          <div className="h-32 bg-white/70 animate-pulse rounded-2xl border border-[#ECE8DC]" />
          <div className="h-32 bg-white/70 animate-pulse rounded-2xl border border-[#ECE8DC]" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[#ECE8DC] bg-white">
          <p className="text-sm font-bold text-[#1A1A1A]">No open disputes found</p>
          <p className="text-xs text-[#8A8A8A] mt-1 font-medium">All platform orders are in good standing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white p-6 rounded-2xl border border-[#ECE8DC] space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECE8DC] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-mono text-sm font-bold text-[#1A1A1A]">Order #{d.order.id.slice(-6)}</span>
                    <AdminStatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-[#8A8A8A] mt-1 font-medium">
                    Buyer: <strong className="text-[#1A1A1A]">{d.order.user?.name || d.order.user?.email}</strong> · Designer:{" "}
                    <strong className="text-[#1A1A1A]">{d.order.designer?.name || "Atelier"}</strong> · Total:{" "}
                    <strong className="font-mono text-[#1A1A1A]">{formatPrice(d.order.total / 100)}</strong>
                  </p>
                </div>

                {d.resolution && (
                  <AdminStatusBadge status={d.resolution} />
                )}
              </div>

              <div className="bg-[#F4F0E5]/60 p-4 rounded-xl border border-[#ECE8DC] text-xs space-y-1.5">
                <p><strong className="uppercase text-[#8A8A8A] text-[10px] block">Claim Reason:</strong> {d.buyerReason}</p>
                {d.description && (
                  <p><strong className="uppercase text-[#8A8A8A] text-[10px] block">Buyer Details:</strong> {d.description}</p>
                )}
              </div>

              {/* Courier Tracking Status */}
              {d.order.courierName && (
                <div className="text-xs font-mono text-[#8A8A8A] bg-white p-3 rounded-xl border border-[#ECE8DC] flex items-center justify-between">
                  <span>Courier: <strong className="text-[#1A1A1A]">{d.order.courierName}</strong> (AWB: {d.order.trackingNumber})</span>
                  {d.order.trackingUrl && (
                    <a href={d.order.trackingUrl} target="_blank" rel="noreferrer" className="text-blue-700 font-bold underline">
                      Verify Tracking ↗
                    </a>
                  )}
                </div>
              )}

              {/* Dispute Resolution Actions */}
              {d.status !== "resolved" && (
                <div className="pt-2 border-t border-[#ECE8DC] space-y-3">
                  <input
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter resolution notes / courier investigation results…"
                    className="w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] p-3 text-xs outline-none"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={resolvingId === d.id}
                      onClick={() => handleResolve(d.id, "delivered_confirmed")}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#A9E4B0] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-full shadow-2xs hover:bg-[#A9E4B0]/90 disabled:opacity-60 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Confirm Delivery (Unfreeze Payout)
                    </button>

                    <button
                      type="button"
                      disabled={resolvingId === d.id}
                      onClick={() => handleResolve(d.id, "refunded")}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#F2A6A6] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-full shadow-2xs hover:bg-[#F2A6A6]/90 disabled:opacity-60 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Issue Refund to Buyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
