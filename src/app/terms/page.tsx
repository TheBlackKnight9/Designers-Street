import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export const metadata = {
  title: "Terms of Service | Designer's Street",
  description: "Terms and Conditions governing the use of Designer's Street marketplace.",
};

export default function TermsPage() {
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-24 px-4 pt-6 max-w-3xl mx-auto space-y-6">
        <div>
          <Link href="/profile" className="text-xs text-stone hover:text-charcoal font-semibold">
            ← Account
          </Link>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-charcoal mt-2">
            Terms of Service
          </h1>
          <p className="text-xs text-stone mt-1">Last Updated: August 2026</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cloud space-y-6 text-xs text-charcoal leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              1. Platform Overview
            </h2>
            <p>
              Designer&apos;s Street operates as a curated luxury fashion marketplace connecting independent fashion designer houses with buyers worldwide. By registering an account or placing orders, you agree to these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              2. Orders &amp; Made-to-Order Bespoke
            </h2>
            <p>
              Certain designer pieces offered on Designer&apos;s Street are made-to-order or custom-fit. Estimated lead times are specified on product details. Orders confirmed with custom specifications cannot be cancelled once production begins.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              3. Pricing &amp; Payments
            </h2>
            <p>
              All prices are displayed in INR including applicable taxes unless stated otherwise. Payments are securely processed. Designers retain intellectual property rights for all proprietary garment designs and campaign media.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              4. Authenticity &amp; Quality Guarantee
            </h2>
            <p>
              Every garment sold through Designer&apos;s Street is verified for brand authenticity directly with partner Designer Houses.
            </p>
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
