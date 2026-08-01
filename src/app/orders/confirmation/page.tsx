"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("razorpay_payment_id") || "pay_confirmed";

  return (
    <div className="bg-white p-8 rounded-3xl border border-cloud space-y-4 shadow-sm">
      <span className="text-4xl block">✨</span>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
        Order Confirmed!
      </h1>
      <p className="text-xs text-stone max-w-md mx-auto leading-relaxed">
        Thank you for shopping on Designer&apos;s Street. Your order has been placed and split across fulfilling Designer Houses for direct atelier dispatch.
      </p>

      <div className="p-3 bg-mist rounded-2xl border border-cloud text-xs font-mono font-bold text-charcoal">
        Payment Ref: {paymentId}
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
        <Link
          href="/orders"
          className="px-6 py-3 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full inline-block shadow-md hover:bg-black"
        >
          Track My Orders
        </Link>
        <Link
          href="/store"
          className="px-6 py-3 border border-cloud text-stone font-sans text-xs font-bold uppercase rounded-full inline-block hover:bg-mist"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-24 px-4 pt-12 max-w-xl mx-auto text-center space-y-6">
        <Suspense fallback={<div className="h-64 rounded-3xl bg-mist animate-pulse" />}>
          <OrderConfirmationContent />
        </Suspense>
      </main>
    </>
  );
}
