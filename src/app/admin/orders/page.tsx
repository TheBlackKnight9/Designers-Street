"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/dashboard/Toast";
import { formatPrice } from "@/lib/mock-data";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  Mail,
  Phone,
  MessageCircle,
  X,
  MoreHorizontal,
  ChevronDown,
  Truck,
  CheckCircle,
  Package,
  AlertTriangle,
} from "lucide-react";

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        if (data.data.orders.length > 0 && !selectedOrder) {
          setSelectedOrder(data.data.orders[0]);
        }
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

  const activeDrawerOrder = selectedOrder || (orders.length > 0 ? orders[0] : null);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Orders & Logistics Desk"
        subtitle="Track platform orders, manage courier dispatches, and trigger SMS updates"
      />

      {/* Toolbar Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Pill Dropdown */}
          <div className="relative">
            <select
              value={filter}
              aria-label="Filter orders by status"
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-white border border-[#ECE8DC] text-[#1A1A1A] font-sans text-xs font-bold px-4 py-2 pr-8 rounded-full shadow-2xs outline-none cursor-pointer hover:border-[#17181D] transition-colors"
            >
              <option value="all">Any Status</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="disputed">Disputed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A8A8A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link
            href="/admin/disputes"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#ECE8DC] text-[#1A1A1A] text-xs font-bold rounded-full hover:bg-white/80 shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Disputes Desk</span>
          </Link>
        </div>

        <span className="text-xs text-[#8A8A8A] font-semibold">
          Showing {orders.length} orders
        </span>
      </div>

      {/* Main Grid: Data Table (Left) + Detail Drawer (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Orders Data Table (Left Column) */}
        <div className={`${activeDrawerOrder ? "xl:col-span-8" : "xl:col-span-12"} space-y-3`}>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/70 animate-pulse border border-[#ECE8DC]" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-[#ECE8DC] bg-white">
              <p className="text-sm font-bold text-[#1A1A1A]">No orders found under this filter</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#ECE8DC] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ECE8DC] text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] bg-[#FAF8F5]">
                      <th className="py-3 px-4 w-10 text-center">#</th>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECE8DC]">
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
                              ? "bg-[#F4F0E5] shadow-inner font-semibold"
                              : "hover:bg-[#FAF8F5]"
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => setSelectedOrder(ord)}
                              aria-label={`Select order ${ord.id}`}
                              className="rounded-full w-4 h-4 accent-[#17181D] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#1A1A1A]">
                            #{ord.id.slice(-6)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#17181D] text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                {customerName.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-xs font-bold text-[#1A1A1A] truncate max-w-[140px]">
                                {customerName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <AdminStatusBadge status={ord.status} />
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#1A1A1A]">
                            {formatPrice(ord.total / 100)}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#8A8A8A] font-medium whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-full hover:bg-black/5 text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
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
          <div className="xl:col-span-4 bg-white rounded-2xl border border-[#ECE8DC] p-6 shadow-sm space-y-6 sticky top-4">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#ECE8DC] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-[#1A1A1A]">
                    Order #{activeDrawerOrder.id.slice(-6)}
                  </h3>
                  <AdminStatusBadge status={activeDrawerOrder.status} />
                </div>
                <p className="text-[11px] text-[#8A8A8A] font-medium mt-0.5">
                  Placed on {new Date(activeDrawerOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-[#F4F0E5] text-[#1A1A1A] flex items-center justify-center hover:bg-[#ECE8DC] transition-colors"
                aria-label="Close detail panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Info Box */}
            <div className="text-center space-y-3 py-2">
              <div className="w-16 h-16 rounded-full bg-[#F6D746] text-[#1A1A1A] font-bold text-xl flex items-center justify-center mx-auto shadow-xs border-2 border-white">
                {(activeDrawerOrder.user?.name || activeDrawerOrder.user?.email || "U").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1A1A1A]">
                  {activeDrawerOrder.user?.name || "Customer"}
                </h4>
                <p className="text-xs text-[#8A8A8A] truncate max-w-[220px] mx-auto">
                  {activeDrawerOrder.user?.email}
                </p>
              </div>

              {/* Action Circle Buttons */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <a
                  href={`mailto:${activeDrawerOrder.user?.email}`}
                  className="w-9 h-9 rounded-full bg-[#F4F0E5] text-[#1A1A1A] flex items-center justify-center hover:bg-[#ECE8DC] transition-colors"
                  title="Send Email"
                >
                  <Mail className="w-4 h-4 stroke-[1.8]" />
                </a>
                <button
                  type="button"
                  onClick={() => push(`Call buyer: ${activeDrawerOrder.user?.email}`, "ok")}
                  className="w-9 h-9 rounded-full bg-[#F4F0E5] text-[#1A1A1A] flex items-center justify-center hover:bg-[#ECE8DC] transition-colors"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4 stroke-[1.8]" />
                </button>
                <button
                  type="button"
                  onClick={() => push(`MSG91 SMS sent to ${activeDrawerOrder.user?.email}`, "ok")}
                  className="w-9 h-9 rounded-full bg-[#F4F0E5] text-[#1A1A1A] flex items-center justify-center hover:bg-[#ECE8DC] transition-colors"
                  title="SMS Notification"
                >
                  <MessageCircle className="w-4 h-4 stroke-[1.8]" />
                </button>
              </div>
            </div>

            {/* Order Items List */}
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#8A8A8A] mb-3">
                Order Items ({activeDrawerOrder.items.length})
              </h4>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {activeDrawerOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-[#F4F0E5]/50 p-2.5 rounded-xl border border-[#ECE8DC]">
                    {item.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-14 rounded-lg bg-[#ECE8DC] flex items-center justify-center text-xs font-bold text-[#8A8A8A]">
                        Item
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#1A1A1A] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#8A8A8A] font-semibold">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                      <p className="text-xs font-mono font-bold text-[#1A1A1A] mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier Status (if shipped) */}
            {activeDrawerOrder.courierName && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                  <span>Courier: {activeDrawerOrder.courierName}</span>
                  <Truck className="w-4 h-4 text-blue-700" />
                </div>
                <p className="text-[11px] font-mono text-blue-800">
                  AWB: {activeDrawerOrder.trackingNumber}
                </p>
                {activeDrawerOrder.trackingUrl && (
                  <a
                    href={activeDrawerOrder.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-900 underline block pt-1 hover:text-blue-700"
                  >
                    Track Live Shipment ↗
                  </a>
                )}
              </div>
            )}

            {/* Total Row */}
            <div className="border-t border-b border-[#ECE8DC] py-3 flex items-center justify-between">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
                Total Amount
              </span>
              <span className="font-mono text-lg font-bold text-[#1A1A1A]">
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
                  className="flex-1 py-3 bg-[#F6D746] text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#F6D746]/90 transition-all shadow-2xs active:scale-95 cursor-pointer text-center"
                >
                  Mark Shipped
                </button>
              )}

              {activeDrawerOrder.status === "shipped" && (
                <button
                  type="button"
                  onClick={() => handleMarkDelivered(activeDrawerOrder.id)}
                  className="flex-1 py-3 bg-[#A9E4B0] text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#A9E4B0]/90 transition-all shadow-2xs active:scale-95 cursor-pointer text-center"
                >
                  Mark Delivered
                </button>
              )}

              {activeDrawerOrder.status === "delivered" && (
                <div className="flex-1 py-2.5 bg-[#F4F0E5] text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider rounded-full text-center flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#ECE8DC]">
            <div className="flex justify-between items-center border-b border-[#ECE8DC] pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A8A] block">
                  Logistics Dispatch
                </span>
                <h3 className="font-display text-base font-bold uppercase text-[#1A1A1A]">
                  Ship Order #{shippingOrder.id.slice(-6)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShippingOrder(null)}
                className="w-7 h-7 rounded-full bg-[#F4F0E5] text-[#1A1A1A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkShipped} className="space-y-3">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Courier Partner *</span>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] p-3 text-xs outline-none font-bold"
                >
                  {COURIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Tracking / AWB Number *</span>
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
                  className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] p-3 text-xs font-mono font-bold outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Live Tracking URL</span>
                <input
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://delhivery.com/track/..."
                  className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] p-3 text-xs font-mono outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={submittingShip}
                className="w-full py-3.5 bg-[#F6D746] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-[#F6D746]/90 disabled:opacity-60 cursor-pointer"
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
