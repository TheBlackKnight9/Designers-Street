"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Suspense } from "react";

function FailedContent() {
  const searchParams = useSearchParams();
  const rawReason = searchParams.get("reason") || "payment_cancelled";

  let reasonTitle = "Payment Could Not Be Completed";
  let reasonText = "Your payment attempt was cancelled or declined by the issuing bank.";

  if (rawReason === "dismissed") {
    reasonTitle = "Payment Window Closed";
    reasonText = "You closed the payment modal before completing the transaction.";
  } else if (rawReason === "insufficient_funds") {
    reasonTitle = "Insufficient Account Balance";
    reasonText = "Your card or bank account has insufficient funds. Please try another card or UPI option.";
  } else if (rawReason === "timeout" || rawReason === "bank_timeout") {
    reasonTitle = "Bank Timeout / Network Error";
    reasonText = "The banking gateway timed out while processing. No funds were debited.";
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-cloud space-y-4 shadow-sm">
      <div className="w-16 h-16 bg-red-50 text-red-700 rounded-full flex items-center justify-center text-2xl mx-auto">
        ⚠️
      </div>
      <h1 className="font-display text-2xl font-bold uppercase text-charcoal">
        {reasonTitle}
      </h1>
      <p className="text-xs text-stone max-w-md mx-auto leading-relaxed">
        {reasonText} Don&apos;t worry — your selected items remain locked in your bag for 15 minutes.
      </p>

      <div className="bg-mist/50 p-4 rounded-2xl border border-cloud text-xs text-stone space-y-1">
        <span className="font-bold uppercase text-charcoal block">✨ 15-Minute Reserved Stock Guarantee</span>
        <p>Your items are held in your cart so you won&apos;t lose your size while retrying.</p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/checkout"
          className="px-6 py-3.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full inline-block shadow-md hover:bg-black"
        >
          🔄 Retry Payment Now
        </Link>
        <Link
          href="/cart"
          className="px-6 py-3.5 border border-cloud text-stone font-sans text-xs font-bold uppercase rounded-full inline-block hover:bg-mist"
        >
          Return to Bag
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-24 px-4 pt-12 max-w-xl mx-auto text-center">
        <Suspense fallback={<div className="p-8 bg-white rounded-3xl border border-cloud">Loading...</div>}>
          <FailedContent />
        </Suspense>
      </main>
    </>
  );
}
