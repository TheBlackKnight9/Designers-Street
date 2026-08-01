import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export const metadata = {
  title: "Seller Agreement | Designer's Street",
  description: "Terms and Commission Agreement for Partner Designer Houses.",
};

export default function SellerTermsPage() {
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-24 px-4 pt-6 max-w-3xl mx-auto space-y-6">
        <div>
          <Link href="/dashboard/settings/verification" className="text-xs text-stone hover:text-charcoal font-semibold">
            ← Back to Verification
          </Link>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-charcoal mt-2">
            Seller Terms &amp; Commission Agreement
          </h1>
          <p className="text-xs text-stone mt-1">Version 2.4 · Effective August 2026</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cloud space-y-6 text-xs text-charcoal leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              1. Platform Commission &amp; Payout Terms
            </h2>
            <p>
              Designer&apos;s Street charges a standard <strong>15% platform commission</strong> on all completed retail orders. Net payouts (85% of order retail value) are automatically calculated and processed via Razorpay Route or NEFT.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              2. Bi-Monthly Settlement Schedule
            </h2>
            <p>
              Settlement payouts occur twice monthly on the <strong>1st and 15th</strong> of each month for all orders delivered at least 7 days prior (allowing for return inspection clearance).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              3. Fulfillment &amp; Packaging Standards
            </h2>
            <p>
              Designer Houses are responsible for carefully packaging garments in signature luxury boxes or garment covers and handing over shipments to authorized logistics partners within 48 hours of order acceptance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              4. Authenticity &amp; Intellectual Property
            </h2>
            <p>
              All listed designs must be authentic creations of the Partner Designer House. Copyrights and media assets remain the exclusive property of the designer.
            </p>
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
