"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { formatPrice } from "@/lib/mock-data";

type OrderRow = {
  id: string;
  status: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
};

type StatusFilter = "all" | "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

function statusBadgeClass(status: string, paymentStatus: string): string {
  const s = status.toLowerCase();
  if (s === "delivered") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "shipped") return "bg-indigo-100 text-indigo-800 border-indigo-200";
  if (s === "processing") return "bg-violet-100 text-violet-800 border-violet-200";
  if (s === "paid" || paymentStatus === "paid") return "bg-sky-100 text-sky-800 border-sky-200";
  if (s === "pending") return "bg-amber-100 text-amber-900 border-amber-200";
  if (s.includes("cancelled") || s === "disputed") return "bg-red-100 text-red-800 border-red-200";
  return "bg-mist text-stone border-[var(--border-default)]";
}

function formatStatusLabel(status: string, paymentStatus: string): string {
  if (status === "pending" && paymentStatus === "paid") return "Paid · Processing";
  return status.replace(/_/g, " ");
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((body) => {
        if (!body?.ok) throw new Error(body?.error?.message || "Failed");
        setOrders(body.data.orders || []);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load orders")
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "paid") {
      return orders.filter(
        (o) => o.status === "paid" || o.paymentStatus === "paid"
      );
    }
    if (filter === "cancelled") {
      return orders.filter((o) =>
        o.status.includes("cancelled") || o.status === "disputed"
      );
    }
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-24">
        <div className="px-4 pt-5 pb-3">
          <h1 className="font-display text-2xl font-bold text-charcoal uppercase tracking-wide">
            Orders
          </h1>
          <p className="font-sans text-xs text-stone mt-1">
            Purchase history and status
          </p>
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border transition-colors ${
                filter === f.id
                  ? "bg-charcoal text-paper border-charcoal"
                  : "bg-paper text-stone border-[var(--border-default)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="px-4 text-sm text-stone">Loading orders…</p>
        )}
        {error && (
          <p className="mx-4 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-stone mb-4">No orders yet.</p>
            <Link
              href="/store"
              className="inline-flex px-6 py-3 bg-charcoal text-paper text-xs uppercase tracking-wider rounded-full"
            >
              Browse store
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && filtered.length === 0 && (
          <p className="px-4 text-sm text-stone">No orders in this filter.</p>
        )}

        <div className="px-4 space-y-3">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block p-4 border border-[var(--border-subtle)] rounded-xl bg-paper"
            >
              <div className="flex justify-between gap-3 items-start">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-charcoal truncate">
                    {order.items[0]?.name || "Order"}
                    {order.items.length > 1
                      ? ` +${order.items.length - 1} more`
                      : ""}
                  </p>
                  <p className="text-xs text-stone mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${statusBadgeClass(
                      order.status,
                      order.paymentStatus
                    )}`}
                  >
                    {formatStatusLabel(order.status, order.paymentStatus)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-charcoal shrink-0">
                  {formatPrice(order.total)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
