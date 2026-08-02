"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/dashboard/Toast";
import { formatPrice } from "@/lib/mock-data";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Buyer Dispute Protection &amp; Payout Hold Desk
          </h1>
          <p className="text-xs text-stone mt-1">
            Review non-delivery claims, verify courier tracking logs, unfreeze valid payouts, or issue buyer refunds
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="px-5 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-black"
        >
          ← Back to Dispatch Desk
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-32 bg-mist rounded-2xl animate-pulse" />
          <div className="h-32 bg-mist rounded-2xl animate-pulse" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-cloud bg-white">
          <p className="text-sm font-semibold text-charcoal">🎉 No active buyer disputes!</p>
          <p className="text-xs text-stone mt-1">All designer payouts are processing normally without frozen holds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cloud pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-charcoal">Dispute #{d.id.slice(-6)}</span>
                    <span
                      className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${
                        d.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-900"
                      }`}
                    >
                      {d.status}
                    </span>
                    {d.resolution && (
                      <span className="px-2 py-0.5 bg-mist text-stone text-[9px] font-mono font-bold uppercase rounded">
                        Resolution: {d.resolution}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone mt-0.5">
                    Order: <strong className="text-charcoal">#{d.order?.id.slice(-6)}</strong> ({formatPrice(d.order?.total / 100)}) · Customer:{" "}
                    <strong className="text-charcoal">{d.order?.user?.name || d.order?.user?.email}</strong> · House:{" "}
                    <strong className="text-charcoal">{d.order?.designer?.name}</strong>
                  </p>
                </div>

                <span className="text-[10px] text-stone font-mono">
                  Reported: {new Date(d.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              {/* Claim Details */}
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-900 block">
                  Buyer Reason: {d.buyerReason}
                </span>
                <p className="text-xs text-red-950 font-medium">{d.description}</p>
              </div>

              {/* Tracking Verification */}
              {d.order?.courierName && (
                <div className="bg-mist/50 p-3.5 rounded-2xl border border-cloud flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-charcoal">Courier Record: {d.order.courierName}</span>
                    <span className="text-stone ml-2">AWB: <strong className="font-mono text-charcoal">{d.order.trackingNumber}</strong></span>
                  </div>
                  {d.order.trackingUrl && (
                    <a
                      href={d.order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-charcoal underline hover:text-black"
                    >
                      Verify Live Courier Status ↗
                    </a>
                  )}
                </div>
              )}

              {/* Admin Resolution Form */}
              {d.status !== "resolved" && (
                <div className="pt-2 space-y-3 border-t border-cloud">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Admin Investigation Notes</span>
                    <input
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Courier proof of delivery uploaded by BlueDart team."
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs outline-none"
                    />
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={resolvingId === d.id}
                      onClick={() => handleResolve(d.id, "delivered_confirmed")}
                      className="flex-1 py-3 bg-emerald-700 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-emerald-800 disabled:opacity-60"
                    >
                      ✅ Confirm Delivery &amp; Unfreeze Payout
                    </button>
                    <button
                      type="button"
                      disabled={resolvingId === d.id}
                      onClick={() => handleResolve(d.id, "refunded")}
                      className="flex-1 py-3 bg-red-800 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-red-900 disabled:opacity-60"
                    >
                      💳 Issue Buyer Refund &amp; Cancel Payout
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
