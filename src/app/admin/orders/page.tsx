"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/dashboard/Toast";
import { formatPrice } from "@/lib/mock-data";

type OrderItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
};

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  user: { name: string | null; email: string };
  designer: { name: string; handle: string; logo: string } | null;
  items: OrderItem[];
  disputes?: any[];
};

const COURIER_OPTIONS = ["Delhivery", "BlueDart", "DTDC", "India Post", "DHL Express", "FedEx", "Other"];

export default function AdminOrdersDispatchPage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");

  // Shipping Modal State
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState("Delhivery");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [submittingShip, setSubmittingShip] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}`);
      const data = await res.json();
      if (data?.ok) {
        setOrders(data.data.orders);
      } else {
        push(data?.error?.message || "Failed to load orders", "err");
      }
    } catch {
      push("Error fetching orders", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  async function handleMarkShipped(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingOrder) return;
    setSubmittingShip(true);

    try {
      const res = await fetch(`/api/admin/orders/${shippingOrder.id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courierName,
          trackingNumber,
          trackingUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        push(`Order #${shippingOrder.id.slice(-6)} marked as Shipped via ${courierName}! SMS dispatched.`, "ok");
        setShippingOrder(null);
        setTrackingNumber("");
        setTrackingUrl("");
        fetchOrders();
      } else {
        push(data?.error?.message || "Shipment update failed", "err");
      }
    } catch {
      push("Error updating shipment", "err");
    } finally {
      setSubmittingShip(false);
    }
  }

  async function handleMarkDelivered(orderId: string) {
    if (!confirm("Confirm delivery for this order? SMS notification will be sent to the buyer.")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        push("Order marked as Delivered successfully!", "ok");
        fetchOrders();
      } else {
        push(data?.error?.message || "Delivery update failed", "err");
      }
    } catch {
      push("Error updating delivery status", "err");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Order Dispatch Desk &amp; Courier Logistics
          </h1>
          <p className="text-xs text-stone mt-1">
            Dispatch central orders across all Atelier Designer Houses with tracking numbers &amp; MSG91 SMS updates
          </p>
        </div>

        <Link
          href="/admin/disputes"
          className="px-5 py-2.5 bg-red-100 text-red-900 border border-red-200 font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-red-200 transition-colors"
        >
          ⚠️ View Buyer Disputes
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-cloud pb-1 overflow-x-auto">
        {[
          { key: "all", label: "All Orders" },
          { key: "paid", label: "Paid" },
          { key: "processing", label: "Processing" },
          { key: "shipped", label: "Shipped" },
          { key: "delivered", label: "Delivered" },
          { key: "disputed", label: "Disputed" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
              filter === tab.key
                ? "bg-charcoal text-paper"
                : "bg-white text-stone border border-cloud hover:bg-mist"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-24 bg-mist rounded-2xl animate-pulse" />
          <div className="h-24 bg-mist rounded-2xl animate-pulse" />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-cloud bg-white">
          <p className="text-sm font-semibold text-charcoal">No orders found under this filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const hasDispute = ord.disputes && ord.disputes.length > 0;

            return (
              <div key={ord.id} className="bg-white p-5 rounded-3xl border border-cloud space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cloud pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-charcoal">Order #{ord.id.slice(-6)}</span>
                      <span
                        className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${
                          ord.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : ord.status === "delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.status === "disputed"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {ord.status}
                      </span>
                      {hasDispute && (
                        <span className="px-2 py-0.5 bg-red-600 text-white font-extrabold text-[8px] uppercase rounded">
                          Dispute Raised
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone mt-0.5">
                      Customer: <strong className="text-charcoal">{ord.user?.name || ord.user?.email}</strong> · Designer:{" "}
                      <strong className="text-charcoal">{ord.designer?.name || "Atelier"}</strong> ·{" "}
                      {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-extrabold text-charcoal">
                      {formatPrice(ord.total / 100)}
                    </span>

                    {ord.status !== "shipped" && ord.status !== "delivered" && (
                      <button
                        type="button"
                        onClick={() => {
                          setShippingOrder(ord);
                          setTrackingNumber(ord.trackingNumber || "");
                          setTrackingUrl(ord.trackingUrl || "");
                        }}
                        className="px-4 py-2 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-black"
                      >
                        📦 Mark Shipped
                      </button>
                    )}

                    {ord.status === "shipped" && (
                      <button
                        type="button"
                        onClick={() => handleMarkDelivered(ord.id)}
                        className="px-4 py-2 bg-emerald-700 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-emerald-800"
                      >
                        ✅ Mark Delivered
                      </button>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-mist/30 p-2.5 rounded-2xl border border-cloud">
                      {item.image && (
                        <div className="w-10 h-12 rounded-lg overflow-hidden border border-cloud shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-charcoal truncate">{item.name}</p>
                        <p className="text-[10px] text-stone">Size: {item.size} · Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Courier & Tracking Details */}
                {ord.courierName && (
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-blue-950">Courier: {ord.courierName}</span>
                      <span className="text-stone ml-2">AWB: <strong className="font-mono text-charcoal">{ord.trackingNumber}</strong></span>
                    </div>
                    {ord.trackingUrl && (
                      <a
                        href={ord.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-blue-900 underline hover:text-blue-700"
                      >
                        Track Shipment ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mark Shipped Modal */}
      {shippingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-cloud pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone block">Order Dispatch Desk</span>
                <h3 className="font-display text-base font-bold uppercase text-charcoal">
                  Ship Order #{shippingOrder.id.slice(-6)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShippingOrder(null)}
                className="text-xs font-bold text-stone hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMarkShipped} className="space-y-3">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Courier Partner *</span>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs outline-none font-medium"
                >
                  {COURIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Tracking / AWB Number *</span>
                <input
                  required
                  value={trackingNumber}
                  onChange={(e) => {
                    const num = e.target.value;
                    setTrackingNumber(num);
                    if (!trackingUrl || trackingUrl.includes("track.courier.in")) {
                      setTrackingUrl(`https://track.courier.in/${num}`);
                    }
                  }}
                  placeholder="e.g. D123456789"
                  className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs font-mono font-bold outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Live Tracking URL</span>
                <input
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://delhivery.com/track/..."
                  className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs font-mono outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={submittingShip}
                className="w-full py-3.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-black disabled:opacity-60"
              >
                {submittingShip ? "Dispatching SMS & Updating…" : "Confirm Shipment & Dispatch SMS →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
