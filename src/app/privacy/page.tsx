import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export const metadata = {
  title: "Privacy Policy | Designer's Street",
  description: "Data Privacy Policy compliant with India Information Technology Act 2000.",
};

export default function PrivacyPage() {
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-12 px-4 pt-6 max-w-3xl mx-auto space-y-6">
        <div>
          <Link href="/profile" className="text-xs text-stone hover:text-charcoal font-semibold">
            ← Account
          </Link>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-charcoal mt-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-stone mt-1">IT Act 2000 &amp; SPDI Rules Compliant · August 2026</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cloud space-y-6 text-xs text-charcoal leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              1. Information We Collect
            </h2>
            <p>
              We collect personal data required for order fulfillment and bespoke tailoring, including full name, delivery address, phone number, email address, and saved body measurement profiles.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              2. Use of Personal Data
            </h2>
            <p>
              Personal data is strictly used for order fulfillment, logistics delivery, customer service communications, bespoke appointment scheduling, and personalized product recommendations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              3. Data Protection &amp; Disclosure
            </h2>
            <p>
              We do not sell personal data. Necessary shipping details are shared only with logistics courier partners and fulfilling Designer Houses to complete your order.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              4. Your Privacy Rights
            </h2>
            <p>
              You may request access to, edit, or delete your saved personal information and saved address book at any time from your Account Settings.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
