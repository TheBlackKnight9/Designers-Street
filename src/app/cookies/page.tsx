import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export const metadata = {
  title: "Cookie Notice | Designer's Street",
  description: "Cookie and tracking policy for Designer's Street web application.",
};

export default function CookiesPage() {
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-12 px-4 pt-6 max-w-3xl mx-auto space-y-6">
        <div>
          <Link href="/profile" className="text-xs text-stone hover:text-charcoal font-semibold">
            ← Account
          </Link>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-charcoal mt-2">
            Cookie Notice
          </h1>
          <p className="text-xs text-stone mt-1">August 2026</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cloud space-y-6 text-xs text-charcoal leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              1. Essential Authentication Cookies
            </h2>
            <p>
              We use essential HTTP cookies to maintain your authenticated session across browser visits and protect customer accounts against unauthorized requests.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              2. Cart &amp; Wishlist Local Storage
            </h2>
            <p>
              Guest shopping carts and saved wishlists utilize browser local storage to preserve your curated items seamlessly when browsing as a guest.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              3. Managing Cookies
            </h2>
            <p>
              You can control or clear cookies through your browser settings at any time. Disabling essential authentication cookies may prevent signing in to your account.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
