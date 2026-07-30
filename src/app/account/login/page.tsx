"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeInternalPath } from "@/lib/safe-redirect";

async function mergeGuestState() {
  try {
    await fetch("/api/cart/merge", { method: "POST" });
  } catch {
    /* guest cookie cart optional */
  }
  // Also merge localStorage guest cart (API-off / fallback path)
  try {
    const raw = localStorage.getItem("ds-cart");
    const lines: { productId: string; size: string; quantity?: number }[] =
      raw ? JSON.parse(raw) : [];
    for (const line of lines) {
      if (!line?.productId || !line?.size) continue;
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: line.productId,
          size: line.size,
          quantity: line.quantity || 1,
        }),
      }).catch(() => undefined);
    }
    if (lines.length) localStorage.removeItem("ds-cart");
  } catch {
    /* ignore */
  }
  try {
    const raw = localStorage.getItem("ds-wishlist");
    const productIds: string[] = raw ? JSON.parse(raw) : [];
    if (productIds.length) {
      await fetch("/api/wishlist/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });
      localStorage.removeItem("ds-wishlist");
    }
  } catch {
    /* ignore */
  }
}

function BuyerLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeInternalPath(params.get("next"), "/profile");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signError) throw signError;

      const boot = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "buyer" }),
      });
      const body = await boot.json();
      if (!boot.ok || body?.ok === false) {
        throw new Error(body?.error?.message || "Account sync failed");
      }

      await mergeGuestState();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ds:commerce-sync"));
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <p className="text-xs tracking-label uppercase text-stone mb-2">
          Designer&apos;s Street
        </p>
        <h1 className="font-display text-3xl text-charcoal mb-2">Sign in</h1>
        <p className="text-sm text-stone mb-8">
          Access your orders, wishlist, and saved addresses.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs tracking-label uppercase text-stone">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>
          <label className="block">
            <span className="text-xs tracking-label uppercase text-stone">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-charcoal text-paper py-3 text-sm tracking-wide disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          <Link
            href="/account/forgot-password"
            className="text-stone hover:text-charcoal underline"
          >
            Forgot password?
          </Link>
        </p>
        <p className="mt-6 text-sm text-stone">
          New here?{" "}
          <Link href="/account/signup" className="text-charcoal underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-sm text-stone">
          Designer?{" "}
          <Link href="/login" className="text-charcoal underline">
            Designer sign in
          </Link>
        </p>
        <p className="mt-2 text-sm">
          <Link href="/" className="text-stone hover:text-charcoal">
            ← Back to shop
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center text-stone">
          Loading…
        </div>
      }
    >
      <BuyerLoginForm />
    </Suspense>
  );
}
