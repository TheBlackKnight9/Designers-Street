"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/dashboard/Toast";
import { formatPrice } from "@/lib/mock-data";

type OrderItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
};

type Order = {
  id: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "disputed";
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingAddress: any;
  createdAt: string;
  items: OrderItem[];
};

const COURIER_OPTIONS = ["BlueDart", "DTDC", "Delhivery", "India Post", "DHL Express", "FedEx", "Other"];

export default function DesignerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { push } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showShipModal, setShowShipModal] = useState(false);
  const [courierName, setCourierName] = useState("BlueDart");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/dashboard/orders`);
      const data = await res.json();
      if (data?.ok && Array.isArray(data.data?.orders)) {
        const found = data.data.orders.find((o: Order) => o.id === id);
        if (found) setOrder(found);
      }
    } catch {
      push("Failed to load order details", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function handleFulfill(action: "accept" | "reject" | "ship" | "deliver") {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/dashboard/orders/${id}/fulfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          courierName,
          trackingNumber,
          trackingUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        push(`Order status updated to ${action.toUpperCase()}`, "ok");
        setShowShipModal(false);
        await fetchOrder();
      } else {
        push(data?.error?.message || "Fulfillment update failed", "err");
      }
    } catch {
      push("Network error updating order", "err");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-stone animate-pulse">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-sm font-semibold text-charcoal">Order Not Found</p>
        <Link href="/dashboard/orders" className="text-xs underline text-stone font-bold">← Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard/orders" className="text-xs font-bold text-stone hover:text-charcoal">
          ← Back to Orders
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Order #{order.id.slice(-8)}
          </h1>
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-charcoal text-paper">
            {order.status}
          </span>
        </div>
        <p className="text-xs text-stone mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      {/* Accept / Reject / Ship Actions */}
      <div className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
        <h2 className="font-display text-sm font-bold uppercase text-charcoal">Order Actions &amp; SLA Management</h2>

        <div className="flex flex-wrap gap-3">
          {(order.status === "pending" || order.status === "paid") && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleFulfill("accept")}
                className="px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase rounded-full shadow-xs hover:bg-black"
              >
                Accept Order (Start Prep)
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleFulfill("reject")}
                className="px-5 py-2.5 border border-red-200 text-red-700 text-xs font-bold uppercase rounded-full hover:bg-red-50"
              >
                Reject Order &amp; Auto-Refund
              </button>
            </>
          )}

          {(order.status === "processing" || order.status === "paid") && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setShowShipModal(true)}
              className="px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase rounded-full shadow-xs hover:bg-black"
            >
              Dispatch &amp; Mark as Shipped →
            </button>
          )}

          {order.status === "shipped" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleFulfill("deliver")}
              className="px-5 py-2.5 bg-emerald-800 text-white text-xs font-bold uppercase rounded-full shadow-xs hover:bg-emerald-900"
            >
              Confirm Delivery
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
        <h2 className="font-display text-sm font-bold uppercase text-charcoal">Purchased Garments</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative w-14 h-16 rounded-xl bg-mist overflow-hidden shrink-0 border border-cloud">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-charcoal truncate">{item.name}</p>
                <p className="text-[10px] text-stone">Size: {item.size} · Qty: {item.quantity}</p>
              </div>
              <p className="text-xs font-mono font-bold text-charcoal">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white p-6 rounded-3xl border border-cloud space-y-2 shadow-xs">
        <h2 className="font-display text-sm font-bold uppercase text-charcoal">Delivery Address</h2>
        <p className="text-xs text-stone leading-relaxed">
          <strong className="text-charcoal block">{order.shippingAddress?.fullName}</strong>
          {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
          <br />
          Phone: {order.shippingAddress?.phone || "N/A"}
        </p>
      </div>

      {/* Mark as Shipped Modal */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-display text-lg font-bold uppercase text-charcoal">Shipment &amp; Tracking Details</h3>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Courier Partner</span>
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none font-bold"
              >
                {COURIER_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Tracking / AWB Number *</span>
              <input
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. BLUEDART198273"
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs font-mono font-bold outline-none"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Tracking URL (Optional)</span>
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none"
              />
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowShipModal(false)}
                className="flex-1 py-3 border border-cloud text-stone text-xs font-bold uppercase rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !trackingNumber.trim()}
                onClick={() => handleFulfill("ship")}
                className="flex-2 py-3 bg-charcoal text-paper text-xs font-bold uppercase rounded-full shadow-md disabled:opacity-60"
              >
                {actionLoading ? "Saving…" : "Save & Dispatch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
