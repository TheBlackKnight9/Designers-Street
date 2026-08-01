"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

function DesignerPortalContent() {
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice");

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-24">
        {/* Banner Notice if redirected */}
        {notice === "designers_only" && (
          <div className="bg-[#2B2B2B] text-paper text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider shadow-sm">
            ✨ Designers only area. Please log in or apply for a Designer House account to access the Studio.
          </div>
        )}

        {/* Hero Section */}
        <section className="relative px-6 py-16 md:py-24 text-center max-w-4xl mx-auto space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-charcoal/5 px-3 py-1.5 rounded-full">
            Designer House Ecosystem
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-charcoal leading-tight uppercase tracking-tight">
            Sell Your Luxury Collections on Designer&apos;s Street
          </h1>
          <p className="text-sm md:text-base text-stone max-w-2xl mx-auto leading-relaxed">
            Join India&apos;s premier luxury fashion marketplace. Launch your digital atelier, manage custom bespoke orders, showcase campaign editorial content, and reach discerning global connoisseurs.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-widest rounded-full hover:bg-black transition-colors shadow-md"
            >
              Sign In to Designer Studio
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 border border-charcoal text-charcoal font-sans text-xs font-bold uppercase tracking-widest rounded-full hover:bg-mist transition-colors"
            >
              Register New Designer House
            </Link>
          </div>
        </section>

        {/* Studio Features Grid */}
        <section className="px-6 py-12 bg-white/60 border-y border-cloud/60">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-xs font-bold uppercase tracking-widest text-stone text-center mb-8">
              Why Partner With Designer&apos;s Street?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-cloud bg-paper space-y-2">
                <span className="text-2xl">🏛️</span>
                <h3 className="font-display text-sm font-bold text-charcoal uppercase">
                  Digital Atelier &amp; Lookbooks
                </h3>
                <p className="text-xs text-stone leading-relaxed">
                  Curate interactive digital lookbooks, editorial campaigns, and video reels to present your brand universe with uncompromising elegance.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-cloud bg-paper space-y-2">
                <span className="text-2xl">✂️</span>
                <h3 className="font-display text-sm font-bold text-charcoal uppercase">
                  Bespoke Consultation
                </h3>
                <p className="text-xs text-stone leading-relaxed">
                  Offer made-to-order couture, manage customer body measurements, and conduct 1-on-1 virtual or studio appointments seamlessly.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-cloud bg-paper space-y-2">
                <span className="text-2xl">📊</span>
                <h3 className="font-display text-sm font-bold text-charcoal uppercase">
                  Full Merchant CMS
                </h3>
                <p className="text-xs text-stone leading-relaxed">
                  Track real-time inventory, manage incoming buyer orders, review analytics, and settled payments from a unified dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="px-6 py-16 text-center space-y-4">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Ready to Expand Your Luxury Presence?
          </h2>
          <p className="text-xs text-stone max-w-md mx-auto">
            Experience our full designer suite with dedicated onboarding support.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-sm"
            >
              Apply for Studio Access
            </Link>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}

export default function DesignerPortalPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone text-xs">Loading Studio Portal…</div>}>
      <DesignerPortalContent />
    </Suspense>
  );
}
