"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";
import { useToast } from "@/components/dashboard/Toast";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  ChevronDown,
  AlertTriangle,
  Mail,
  Phone,
  MessageCircle,
  MoreHorizontal,
  X,
  Truck,
  CheckCircle,
} from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  designer?: {
    id: string;
    name: string;
  } | null;
  items: OrderItem[];
};

const COURIER_OPTIONS = ["Delhivery", "BlueDart", "Shiprocket", "DTDC", "FedEx"];

export default function AdminOrdersPage() {
  const { push } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Ship Modal State
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState("Delhivery");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [submittingShip, setSubmittingShip] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}`);
      const body = await res.json();
      if (body?.ok && Array.isArray(body.data?.orders)) {
        setOrders(body.data.orders);
        if (!selectedOrder && body.data.orders.length > 0) {
          setSelectedOrder(body.data.orders[0]);
        }
      }
    } catch {
      push("Failed to load orders", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  async function handleMarkShipped(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingOrder || !trackingNumber.trim()) return;

    setSubmittingShip(true);
    try {
      const res = await fetch(`/api/admin/orders/${shippingOrder.id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courierName,
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim() || undefined,
        }),
      });

      const body = await res.json();
      if (res.ok && body?.ok) {
        push(`📦 Order #${shippingOrder.id.slice(-6)} marked shipped via ${courierName}!`, "ok");
        setShippingOrder(null);
        setTrackingNumber("");
        setTrackingUrl("");
        await fetchOrders();
      } else {
        push(body?.error?.message || "Failed to mark shipped", "err");
      }
    } catch {
      push("Error updating shipment", "err");
    } finally {
      setSubmittingShip(false);
    }
  }

  async function handleMarkDelivered(orderId: string) {
    if (!confirm("Confirm customer delivery for this order?")) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: "POST",
      });
      const body = await res.json();
      if (res.ok && body?.ok) {
        push(`🎉 Order #${orderId.slice(-6)} marked delivered!`, "ok");
        await fetchOrders();
      } else {
        push(body?.error?.message || "Failed to mark delivered", "err");
      }
    } catch {
      push("Error updating status", "err");
    }
  }

  const activeDrawerOrder = selectedOrder || (orders.length > 0 ? orders[0] : null);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Orders & Logistics Desk"
        subtitle="Track customer orders, manage shipping dispatches, and review fulfillment status"
      />

      {/* Toolbar Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 flex-wrap">
            {(["all", "paid", "processing", "shipped", "delivered", "disputed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`px-3 py-1 text-xs font-medium capitalize rounded-md transition-all ${
                  filter === s
                    ? "bg-white text-zinc-950 shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Link
            href="/admin/disputes"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg hover:bg-zinc-50 shadow-2xs transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Disputes Desk</span>
          </Link>
        </div>

        <span className="text-xs text-zinc-500 font-medium">
          Showing {orders.length} orders
        </span>
      </div>

      {/* Main Grid: Data Table (Left) + Detail Drawer (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Orders Data Table (Left Column) */}
        <div className={`${activeDrawerOrder ? "xl:col-span-7" : "xl:col-span-12"} space-y-3`}>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white animate-pulse border border-zinc-200" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-zinc-200 bg-white">
              <p className="text-sm font-semibold text-zinc-950">No orders found</p>
              <p className="text-xs text-zinc-500 mt-1">There are no orders under the selected filter.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200/90 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-50/60">
                      <th className="py-3 px-3.5">Order</th>
                      <th className="py-3 px-3.5">Customer</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5">Total</th>
                      <th className="py-3 px-3.5">Date</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {orders.map((ord) => {
                      const isSelected = activeDrawerOrder?.id === ord.id;
                      const customerName = ord.user?.name || ord.user?.email || "Buyer";
                      const dateStr = new Date(ord.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });

                      return (
                        <tr
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? "bg-zinc-50 font-medium"
                              : "hover:bg-zinc-50/80"
                          }`}
                        >
                          <td className="py-3.5 px-3.5 font-mono text-xs font-semibold text-zinc-950">
                            #{ord.id.slice(-6)}
                          </td>
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white font-semibold text-[10px] flex items-center justify-center flex-shrink-0">
                                {customerName.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-zinc-900 truncate max-w-[120px]">
                                {customerName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <AdminStatusBadge status={ord.status} />
                          </td>
                          <td className="py-3.5 px-3.5 font-mono text-xs font-semibold text-zinc-950">
                            {formatPrice(ord.total / 100)}
                          </td>
                          <td className="py-3.5 px-3.5 text-xs text-zinc-500 whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="py-3.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                              aria-label="View Order Options"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Selected Order Detail Drawer (Right Column) */}
        {activeDrawerOrder && (
          <div className="xl:col-span-5 bg-white rounded-xl border border-zinc-200/90 p-5 shadow-2xs space-y-5 sticky top-4">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-zinc-950 tracking-tight">
                    Order #{activeDrawerOrder.id.slice(-6)}
                  </h3>
                  <AdminStatusBadge status={activeDrawerOrder.status} />
                </div>
                <p className="text-xs text-zinc-500 font-normal mt-0.5">
                  Placed on {new Date(activeDrawerOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close detail panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Customer Info Box */}
            <div className="rounded-lg bg-zinc-50 border border-zinc-200/80 p-3.5 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-zinc-950 text-white font-semibold text-sm flex items-center justify-center mx-auto shadow-xs">
                {(activeDrawerOrder.user?.name || activeDrawerOrder.user?.email || "U").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-zinc-950">
                  {activeDrawerOrder.user?.name || "Customer"}
                </h4>
                <p className="text-xs text-zinc-500 truncate max-w-[220px] mx-auto">
                  {activeDrawerOrder.user?.email}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <a
                  href={`mailto:${activeDrawerOrder.user?.email}`}
                  className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 flex items-center justify-center transition-colors shadow-2xs"
                  title="Send Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => push(`Call customer: ${activeDrawerOrder.user?.email}`, "ok")}
                  className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  title="Call Customer"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => push(`SMS notification sent to ${activeDrawerOrder.user?.email}`, "ok")}
                  className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  title="SMS Notification"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Order Items List */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-950 uppercase tracking-wider mb-2.5">
                Order Items ({activeDrawerOrder.items.length})
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeDrawerOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/70 p-2.5 rounded-lg">
                    {item.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-md border border-zinc-200 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-12 rounded-md bg-zinc-200/80 flex items-center justify-center text-[10px] font-medium text-zinc-500">
                        Item
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-950 truncate">{item.name}</p>
                      <p className="text-[11px] text-zinc-500 font-normal">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                      <p className="text-xs font-mono font-semibold text-zinc-950 mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier Status (if shipped) */}
            {activeDrawerOrder.courierName && (
              <div className="bg-blue-50/70 border border-blue-200/80 p-3 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-950">
                  <span>Courier: {activeDrawerOrder.courierName}</span>
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[11px] font-mono text-blue-800">
                  AWB: {activeDrawerOrder.trackingNumber}
                </p>
                {activeDrawerOrder.trackingUrl && (
                  <a
                    href={activeDrawerOrder.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-blue-900 underline block pt-0.5 hover:text-blue-700"
                  >
                    Track Live Shipment ↗
                  </a>
                )}
              </div>
            )}

            {/* Total Row */}
            <div className="border-t border-b border-zinc-100 py-3 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Total Amount
              </span>
              <span className="font-mono text-base font-bold text-zinc-950">
                {formatPrice(activeDrawerOrder.total / 100)}
              </span>
            </div>

            {/* Drawer Footer CTA Actions */}
            <div className="flex items-center gap-2 pt-1">
              {activeDrawerOrder.status !== "shipped" && activeDrawerOrder.status !== "delivered" && (
                <button
                  type="button"
                  onClick={() => {
                    setShippingOrder(activeDrawerOrder);
                    setTrackingNumber(activeDrawerOrder.trackingNumber || "");
                    setTrackingUrl(activeDrawerOrder.trackingUrl || "");
                  }}
                  className="flex-1 py-2.5 bg-zinc-950 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-all shadow-xs active:scale-[0.98] cursor-pointer text-center"
                >
                  Mark Shipped
                </button>
              )}

              {activeDrawerOrder.status === "shipped" && (
                <button
                  type="button"
                  onClick={() => handleMarkDelivered(activeDrawerOrder.id)}
                  className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-xs active:scale-[0.98] cursor-pointer text-center"
                >
                  Mark Delivered
                </button>
              )}

              {activeDrawerOrder.status === "delivered" && (
                <div className="flex-1 py-2 bg-zinc-100 text-zinc-800 text-xs font-medium rounded-lg text-center flex items-center justify-center gap-1.5 border border-zinc-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Order Delivered
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mark Shipped Modal */}
      {shippingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl border border-zinc-200">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                  Logistics Dispatch
                </span>
                <h3 className="text-base font-semibold text-zinc-950">
                  Ship Order #{shippingOrder.id.slice(-6)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShippingOrder(null)}
                className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleMarkShipped} className="space-y-3.5">
              <label className="block">
                <span className="text-[11px] font-medium text-zinc-700">Courier Partner *</span>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs font-medium text-zinc-900 outline-none focus:border-zinc-900 shadow-2xs"
                >
                  {COURIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-medium text-zinc-700">Tracking / AWB Number *</span>
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
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs font-mono font-medium text-zinc-900 outline-none focus:border-zinc-900 shadow-2xs"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-medium text-zinc-700">Live Tracking URL</span>
                <input
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://delhivery.com/track/..."
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs font-mono text-zinc-900 outline-none focus:border-zinc-900 shadow-2xs"
                />
              </label>

              <button
                type="submit"
                disabled={submittingShip}
                className="w-full py-2.5 bg-zinc-950 text-white text-xs font-medium rounded-lg shadow-xs hover:bg-zinc-800 disabled:opacity-60 cursor-pointer transition-colors"
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
