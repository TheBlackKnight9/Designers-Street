"use client";

import { use, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { formatPrice } from "@/lib/mock-data";

type OrderDetail = {
  id: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  shippingAddress: Record<string, unknown> | null;
  items: Array<{
    id: string;
    name: string;
    brand: string;
    price: number;
    size: string;
    image: string;
    quantity: number;
  }>;
  events: Array<{
    id: string;
    status: string;
    note: string | null;
    createdAt: string;
  }>;
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Placed" },
  { key: "paid", label: "Confirmed" },
  { key: "processing", label: "In Atelier" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function OrderDetailInner({ orderId }: { orderId: string }) {
  const params = useSearchParams();
  const placed = params.get("placed") === "1";
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("Non-delivery / Item Not Received");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then((r) => r.json())
      .then((body) => {
        if (!body?.ok) throw new Error(body?.error?.message || "Not found");
        setOrder(body.data.order);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [orderId]);

  async function handleDisputeSubmit() {
    setDisputeSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerReason: disputeReason, description: disputeDesc }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setShowDisputeModal(false);
        setOrder((prev) => (prev ? { ...prev, status: "disputed" } : null));
      }
    } catch {
      /* handle error */
    } finally {
      setDisputeSubmitting(false);
    }
  }

  if (error) {
    return (
      <main className="min-h-screen px-4 py-16 text-center">
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <Link href="/orders" className="underline text-xs font-bold text-stone">Back to orders</Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen px-4 py-16 text-center text-stone text-sm animate-pulse">
        Loading order details…
      </main>
    );
  }

  const ship = order.shippingAddress || {};
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status);

  return (
    <main className="min-h-screen pb-28 max-w-3xl mx-auto px-4 pt-6 space-y-6">
      <div>
        <Link href="/orders" className="text-xs font-bold text-stone hover:text-charcoal">
          ← All Orders
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Order #{order.id.slice(-8)}
          </h1>
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-charcoal text-paper">
            {order.status}
          </span>
        </div>
        <p className="text-xs text-stone mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Step-by-Step Visual Timeline */}
      <div className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
        <h2 className="font-display text-sm font-bold uppercase text-charcoal">Fulfillment Progress</h2>
        <div className="grid grid-cols-5 gap-1 items-center">
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex >= idx || order.status === "delivered";
            return (
              <div key={step.key} className="text-center space-y-1.5">
                <div
                  className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCompleted ? "bg-charcoal text-paper" : "bg-mist text-stone"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span className="text-[10px] font-bold uppercase block text-stone truncate">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courier & Tracking Card */}
      {order.courierName && (
        <div className="bg-white p-6 rounded-3xl border border-cloud space-y-3 shadow-xs">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">Courier Tracking Details</h2>
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-charcoal">{order.courierName}</p>
              <p className="font-mono text-stone">AWB: {order.trackingNumber}</p>
            </div>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-charcoal text-paper text-xs font-bold uppercase rounded-full shadow-xs hover:bg-black"
              >
                Track Package ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Purchased Items */}
      <div className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
        <h2 className="font-display text-sm font-bold uppercase text-charcoal">Garment Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative w-14 h-16 rounded-xl bg-mist overflow-hidden shrink-0 border border-cloud">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase text-stone font-bold">{item.brand}</p>
                <p className="text-xs font-bold text-charcoal truncate">{item.name}</p>
                <p className="text-[10px] text-stone">Size: {item.size} · Qty: {item.quantity}</p>
              </div>
              <p className="text-xs font-mono font-bold text-charcoal">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Buyer Protection & Dispute Button */}
      <div className="bg-white p-6 rounded-3xl border border-cloud space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">Buyer Protection</h2>
          <button
            type="button"
            onClick={() => setShowDisputeModal(true)}
            className="text-xs font-bold text-stone underline hover:text-red-700"
          >
            Report Issue / Not Received
          </button>
        </div>
        <p className="text-[11px] text-stone leading-relaxed">
          If your order package is delayed or non-delivered, you can file a formal dispute to freeze payout settlement until verified.
        </p>
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-display text-lg font-bold uppercase text-charcoal">Report Non-Delivery / Dispute</h3>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Dispute Reason</span>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs font-bold outline-none"
              >
                <option value="Non-delivery / Item Not Received">Non-delivery / Item Not Received</option>
                <option value="Damaged Garment Received">Damaged Garment Received</option>
                <option value="Wrong Item Shipped">Wrong Item Shipped</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Description / Details</span>
              <textarea
                rows={3}
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                placeholder="Provide tracking notes or details for admin investigation..."
                className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs outline-none resize-none"
              />
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 py-3 border border-cloud text-stone text-xs font-bold uppercase rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={disputeSubmitting}
                onClick={handleDisputeSubmit}
                className="flex-2 py-3 bg-red-800 text-white text-xs font-bold uppercase rounded-full shadow-md disabled:opacity-60 hover:bg-red-900"
              >
                {disputeSubmitting ? "Filing..." : "Submit Dispute & Freeze Payout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <>
      <TopBar />
      <Suspense fallback={<main className="min-h-screen px-4 py-16 text-center text-sm text-stone">Loading…</main>}>
        <OrderDetailInner orderId={id} />
      </Suspense>
    </>
  );
}
