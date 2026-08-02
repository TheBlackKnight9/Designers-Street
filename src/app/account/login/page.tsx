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
  const notice = params.get("notice");
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

      const boot = await fetch("/api/auth/buyer-bootstrap", {
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

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/account/login?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-cloud rounded-3xl p-8 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest uppercase text-stone mb-1">
          Designer&apos;s Street
        </p>
        <h1 className="font-display text-3xl font-bold text-charcoal mb-1">Customer Sign In</h1>
        <p className="text-xs text-stone mb-6">
          {notice === "wishlist_login_required"
            ? "Sign in to save pieces to your wishlist favorites."
            : next.startsWith("/checkout")
              ? "Sign in to complete checkout and place your order."
              : "Access your luxury orders, wishlist, and saved addresses."}
        </p>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          suppressHydrationWarning
          className="w-full mb-5 flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-cloud bg-mist/50 hover:bg-mist transition-colors text-xs font-bold uppercase tracking-wider text-charcoal disabled:opacity-60 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-cloud/80 w-full" />
          <span className="bg-white px-3 text-[10px] font-bold text-stone uppercase tracking-wider absolute">
            or email
          </span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" suppressHydrationWarning>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Email Address
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              suppressHydrationWarning
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              suppressHydrationWarning
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 rounded-xl px-3 py-2 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className="w-full rounded-full bg-charcoal text-paper py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-60 shadow-sm"
          >
            {loading ? "Signing in…" : "Sign In to Account"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cloud/60 text-center space-y-2 text-xs text-stone">
          <p>
            <Link href="/account/forgot-password" className="hover:text-charcoal underline">
              Forgot password?
            </Link>
          </p>
          <p>
            New to Designer&apos;s Street?{" "}
            <Link href="/account/signup" className="text-charcoal font-bold underline">
              Create a Buyer Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center text-stone text-xs font-bold uppercase tracking-wider">
          Loading auth…
        </div>
      }
    >
      <BuyerLoginForm />
    </Suspense>
  );
}
