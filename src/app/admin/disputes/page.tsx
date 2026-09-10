"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useToast } from "@/components/dashboard/Toast";
import { formatPrice } from "@/lib/mock-data";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  Check,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  Truck,
  User,
  Store,
  Clock,
  ShieldAlert,
  Search,
} from "lucide-react";

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
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [filterTab, setFilterTab] = useState<"all" | "open" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    const note = notesState[disputeId] || "";
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution,
          adminNotes: note,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        push(
          resolution === "delivered_confirmed"
            ? "Dispute resolved: Order unfrozen for designer payout."
            : "Buyer refunded & payout hold cancelled.",
          "ok"
        );
        setNotesState((prev) => ({ ...prev, [disputeId]: "" }));
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

  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const matchesSearch =
        d.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.order.user?.name && d.order.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.order.designer?.name && d.order.designer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.buyerReason && d.buyerReason.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTab =
        filterTab === "all" ? true : filterTab === "resolved" ? d.status === "resolved" : d.status !== "resolved";

      return matchesSearch && matchesTab;
    });
  }, [disputes, searchQuery, filterTab]);

  const openCount = disputes.filter((d) => d.status !== "resolved").length;
  const resolvedCount = disputes.filter((d) => d.status === "resolved").length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Disputes & Escalations Desk"
        subtitle="Review customer non-delivery claims, verify courier tracking logs, and manage settlement holds"
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          label="Total Escalations"
          value={String(disputes.length)}
          icon={<ShieldAlert className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="Pending Investigation"
          value={String(openCount)}
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          badgeBg="bg-amber-100 text-amber-900"
        />
        <AdminStatCard
          label="Resolved Cases"
          value={String(resolvedCount)}
          icon={<Check className="w-4 h-4 text-zinc-900" />}
          badgeBg="bg-zinc-950 text-white"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterTab === "all" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            All ({disputes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("open")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterTab === "open" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Pending Actions ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("resolved")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterTab === "resolved" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order, buyer, or designer..."
            className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Disputes List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-44 bg-white rounded-xl border border-zinc-200/80 animate-pulse" />
          <div className="h-44 bg-white rounded-xl border border-zinc-200/80 animate-pulse" />
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-sm font-semibold text-zinc-950">No disputes found</p>
          <p className="text-xs text-zinc-500 mt-1">
            {disputes.length === 0
              ? "All platform customer orders are in good standing."
              : "No dispute records match your filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((d) => (
            <div
              key={d.id}
              className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-2xs space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="font-mono text-sm font-semibold text-zinc-950">
                      Order #{d.order.id.slice(-8)}
                    </span>
                  </div>
                  <AdminStatusBadge status={d.status} />
                  {d.resolution && <AdminStatusBadge status={d.resolution} />}
                </div>

                <span className="text-xs font-mono font-medium text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(d.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Order & Parties Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-zinc-50/75 p-3 rounded-lg border border-zinc-200/70">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block flex items-center gap-1">
                    <User className="w-3 h-3" /> Buyer Account
                  </span>
                  <p className="font-medium text-zinc-900">{d.order.user?.name || "Guest"}</p>
                  <p className="text-[11px] text-zinc-500">{d.order.user?.email}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block flex items-center gap-1">
                    <Store className="w-3 h-3" /> Designer House
                  </span>
                  <p className="font-medium text-zinc-900">{d.order.designer?.name || "Independent Atelier"}</p>
                  <p className="text-[11px] font-mono text-zinc-500">@{d.order.designer?.handle || "ds"}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                    Escrow Total
                  </span>
                  <p className="font-mono font-bold text-sm text-zinc-950">
                    {formatPrice(d.order.total / 100)}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {d.order.items?.length || 1} item(s) in order
                  </p>
                </div>
              </div>

              {/* Buyer Claim Box */}
              <div className="space-y-1.5">
                <div className="text-xs">
                  <span className="text-[11px] font-semibold text-zinc-600 block">
                    Claim Reason:
                  </span>
                  <p className="text-zinc-900 font-medium bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60 mt-1">
                    {d.buyerReason}
                  </p>
                </div>

                {d.description && (
                  <div className="text-xs">
                    <span className="text-[11px] font-semibold text-zinc-600 block">
                      Customer Description:
                    </span>
                    <p className="text-zinc-700 bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-200/60 mt-1">
                      {d.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Courier Tracking Details */}
              {d.order.courierName && (
                <div className="text-xs bg-zinc-50/75 p-3 rounded-lg border border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-zinc-500" />
                    <span>
                      Courier: <strong className="text-zinc-900">{d.order.courierName}</strong>
                      {d.order.trackingNumber && (
                        <span className="text-zinc-500 font-mono ml-2">AWB: {d.order.trackingNumber}</span>
                      )}
                    </span>
                  </div>

                  {d.order.trackingUrl && (
                    <a
                      href={d.order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-900 hover:text-zinc-600 underline underline-offset-2"
                    >
                      <span>Verify Courier Live Telemetry</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Resolution or Action Footer */}
              {d.status !== "resolved" ? (
                <div className="pt-2 border-t border-zinc-100 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Resolution Notes / Courier Verification Summary
                    </label>
                    <input
                      value={notesState[d.id] || ""}
                      onChange={(e) =>
                        setNotesState((prev) => ({ ...prev, [d.id]: e.target.value }))
                      }
                      placeholder="e.g. Courier POD verified with recipient signature / Delivery failed returned to origin..."
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={resolvingId === d.id}
                      onClick={() => handleResolve(d.id, "delivered_confirmed")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {resolvingId === d.id ? "Processing..." : "Confirm Delivery & Unfreeze Settlement"}
                    </button>

                    <button
                      type="button"
                      disabled={resolvingId === d.id}
                      onClick={() => handleResolve(d.id, "refunded")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                      {resolvingId === d.id ? "Processing..." : "Issue Full Refund to Buyer"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <div>
                    {d.adminNotes && (
                      <p className="text-zinc-600">
                        <strong className="text-zinc-900 font-medium">Audit Note:</strong> {d.adminNotes}
                      </p>
                    )}
                  </div>
                  <span className="font-medium text-zinc-900">Investigation Closed</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
