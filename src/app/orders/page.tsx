"use client";

import { useEffect, useState } from "react";
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-24">
        <div className="px-4 pt-5 pb-4">
          <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
            Orders
          </h1>
          <p className="font-sans text-xs text-[#7A7A7A] mt-1">
            Purchase history and status
          </p>
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

        <div className="px-4 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block p-4 border border-[#E0E0E0] rounded-xl"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    {order.items[0]?.name || "Order"}
                    {order.items.length > 1
                      ? ` +${order.items.length - 1} more`
                      : ""}
                  </p>
                  <p className="text-xs text-stone mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                    {order.status}
                  </p>
                </div>
                <p className="text-sm font-semibold">
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
