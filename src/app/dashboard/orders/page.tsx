"use client";

import { useEffect, useState } from "react";
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

type OrderEvent = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
};

type Order = {
  id: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  total: number;
  currency: string;
  shippingAddress: any;
  createdAt: string;
  items: OrderItem[];
  events: OrderEvent[];
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready_to_ship", label: "Ready to Ship" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;

function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

export default function DesignerOrdersPage() {
  const { push } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/dashboard/orders");
      const data = await res.json();
      if (data?.ok && Array.isArray(data.data?.orders)) {
        setOrders(data.data.orders);
      }
    } catch {
      push("Failed to load orders", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function updateStatus(orderId: string, nextStatus: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/dashboard/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: nextStatus === "accepted" || nextStatus === "preparing" ? "processing" : nextStatus,
          note: `Status updated to ${nextStatus.replace(/_/g, " ")} by Designer`,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        push(`Order updated to ${nextStatus.replace(/_/g, " ")}`, "ok");
        await fetchOrders();
      } else {
        push(data?.error?.message || "Failed to update order", "err");
      }
    } catch {
      push("Error updating order status", "err");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-stone animate-pulse">
        Loading designer orders...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          Order Management
        </h1>
        <p className="text-xs text-stone mt-1">
          Review buyer orders and update status along the fulfillment timeline
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-cloud bg-mist/30">
          <p className="text-sm font-semibold text-charcoal">No orders yet</p>
          <p className="text-xs text-stone mt-1">
            Orders containing your designer pieces will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-2xl border border-cloud bg-paper shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cloud/60">
                <div>
                  <span className="text-xs font-mono font-semibold text-stone uppercase tracking-wider">
                    Order #{order.id.slice(-8)}
                  </span>
                  <p className="text-[10px] text-stone mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-charcoal text-paper">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative w-12 h-14 rounded-lg bg-mist overflow-hidden shrink-0 flex items-center justify-center font-bold text-stone text-[10px]">
                      {isValidImageUrl(item.image) ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        item.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-charcoal truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-stone">
                        Size {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status Timeline Controls */}
              <div className="pt-3 border-t border-cloud/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone mb-2">
                  Update Fulfillment Timeline
                </p>
                <div className="flex flex-wrap gap-2">
                  {TIMELINE_STEPS.map((step) => (
                    <button
                      key={step.key}
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, step.key)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                        order.status === step.key
                          ? "bg-charcoal text-paper border-charcoal"
                          : "bg-mist text-stone border-cloud hover:border-charcoal hover:text-charcoal"
                      }`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
