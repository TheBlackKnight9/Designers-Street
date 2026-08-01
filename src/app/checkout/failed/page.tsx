"use client";

import Link from "next/link";
import { TopBar } from "@/components/TopBar";

export default function CheckoutFailedPage() {
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-24 px-4 pt-12 max-w-xl mx-auto text-center space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-cloud space-y-4 shadow-sm">
          <span className="text-4xl block">⚠️</span>
          <h1 className="font-display text-2xl font-bold uppercase text-charcoal">
            Payment Not Completed
          </h1>
          <p className="text-xs text-stone max-w-md mx-auto leading-relaxed">
            Your transaction was cancelled or could not be completed by your issuing bank. Don&apos;t worry — your selected items remain reserved in your bag for 15 minutes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/checkout"
              className="px-6 py-3 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full inline-block shadow-md hover:bg-black"
            >
              Retry Payment Now
            </Link>
            <Link
              href="/cart"
              className="px-6 py-3 border border-cloud text-stone font-sans text-xs font-bold uppercase rounded-full inline-block hover:bg-mist"
            >
              Return to Bag
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
