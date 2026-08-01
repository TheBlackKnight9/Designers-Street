"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { formatPrice } from "@/lib/mock-data";
import { Suspense } from "react";

type OrderDetail = {
  id: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
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

function OrderDetailInner({ orderId }: { orderId: string }) {
  const params = useSearchParams();
  const placed = params.get("placed") === "1";
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then((r) => r.json())
      .then((body) => {
        if (!body?.ok) throw new Error(body?.error?.message || "Not found");
        setOrder(body.data.order);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      );
  }, [orderId]);

  if (error) {
    return (
      <main className="min-h-screen px-4 py-16 text-center">
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <Link href="/orders" className="underline text-sm">
          Back to orders
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen px-4 py-16 text-center text-stone text-sm">
        Loading order…
      </main>
    );
  }

  const ship = order.shippingAddress || {};

  return (
    <main className="min-h-screen pb-24">
      <div className="px-4 pt-5 pb-4">
        {placed && (
          <p className="mb-3 text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2">
            Order placed. Payment is pending until checkout payment is enabled.
          </p>
        )}
        <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
          Order
        </h1>
        <p className="font-sans text-xs text-[#7A7A7A] mt-1">
          {order.id.slice(0, 8)}… · {order.status} · payment{" "}
          {order.paymentStatus}
        </p>
      </div>

      <div className="px-4 space-y-3 mb-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-3 p-3 bg-[#F0F0F0] rounded-xl">
            <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[#E0E0E0]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <p className="text-xs uppercase text-stone">{item.brand}</p>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-stone">
                Size {item.size} · Qty {item.quantity}
              </p>
              <p className="text-sm font-semibold mt-1">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-stone mb-2">
          Shipping
        </h2>
        <p className="text-sm text-charcoal">
          {String(ship.fullName || "")}
          <br />
          {String(ship.line1 || "")}
          {ship.line2 ? `, ${String(ship.line2)}` : ""}
          <br />
          {String(ship.city || "")}, {String(ship.state || "")}{" "}
          {String(ship.postalCode || "")}
        </p>
        <p className="text-sm font-semibold mt-3">
          Total {formatPrice(order.total)}
        </p>
      </div>

      <div className="px-4">
        <h2 className="text-xs uppercase tracking-wider text-stone mb-3">
          Timeline
        </h2>
        <ol className="space-y-3 border-l border-cloud pl-4">
          {order.events.map((ev) => (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-charcoal" />
              <p className="text-sm font-semibold capitalize">{ev.status}</p>
              {ev.note && <p className="text-xs text-stone">{ev.note}</p>}
              <p className="text-[10px] text-stone mt-0.5">
                {new Date(ev.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="px-4 mt-8">
        <Link href="/orders" className="text-sm underline text-stone">
          ← All orders
        </Link>
      </div>
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
      <Suspense
        fallback={
          <main className="min-h-screen px-4 py-16 text-center text-sm text-stone">
            Loading…
          </main>
        }
      >
        <OrderDetailInner orderId={id} />
      </Suspense>
      <BottomNav />
    </>
  );
}
