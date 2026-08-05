"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeInternalPath } from "@/lib/safe-redirect";
import { getGoogleOAuthRedirectTo, GOOGLE_OAUTH_OPTIONS } from "@/lib/auth/oauth";
import {
  AuthBackLink,
  AuthDivider,
  AuthField,
  AuthGoogleButton,
  AuthPrimaryButton,
  AuthScreen,
} from "@/components/auth/AuthScreen";

async function mergeGuestState() {
  try {
    await fetch("/api/cart/merge", { method: "POST" });
  } catch {
    /* guest cookie cart optional */
  }
  try {
    const raw = localStorage.getItem("ds-cart");
    const lines: { productId: string; size: string; quantity?: number }[] = raw
      ? JSON.parse(raw)
      : [];
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
  const oauthError = params.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    oauthError === "oauth_failed" ? "Google sign-in failed. Please try again." : null
  );
  const [loading, setLoading] = useState(false);

  const subtitle =
    notice === "wishlist_login_required"
      ? "Continue with Google — no password to create. Save pieces to your wishlist."
      : next.startsWith("/checkout")
        ? "Continue with Google to checkout — no app password needed."
        : "Continue with Google for a one-tap sign-in. No password required.";

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
      setError(null);
      const supabase = createClient();
      const { error: oauthErrorResult } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getGoogleOAuthRedirectTo(next),
          ...GOOGLE_OAUTH_OPTIONS,
        },
      });
      if (oauthErrorResult) throw oauthErrorResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      const hint =
        /provider is not enabled|unsupported provider/i.test(message)
          ? " Google login is not enabled yet in Supabase. Enable the Google provider in Authentication → Providers."
          : "";
      setError(message + hint);
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="Welcome back" subtitle={subtitle}>
      {/* Passwordless — Google is the primary path */}
      <AuthGoogleButton
        onClick={handleGoogleLogin}
        loading={loading}
        label="Continue with Google"
      />
      <p className="mt-2 text-center text-[11px] text-stone">
        Uses your Google account · no password to remember
      </p>

      {error && (
        <p className="mt-4 text-xs text-red-700 bg-red-50 rounded-2xl px-3 py-2 font-medium">
          {error}
        </p>
      )}

      <AuthDivider label="OR USE EMAIL & PASSWORD" />

      <form onSubmit={onSubmit} className="space-y-3.5" suppressHydrationWarning>
        <AuthField
          type="email"
          icon="email"
          placeholder="email@domain.com"
          autoComplete="email"
          required
          value={email}
          onChange={setEmail}
        />
        <AuthField
          type="password"
          icon="lock"
          placeholder="••••••••••••"
          autoComplete="current-password"
          required
          minLength={6}
          value={password}
          onChange={setPassword}
        />

        <div className="flex justify-end">
          <Link
            href="/account/forgot-password"
            className="text-[13px] font-bold text-bronze-deep hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthPrimaryButton loading={loading}>
          {loading ? "Signing in…" : "Sign in with email"}
        </AuthPrimaryButton>
      </form>

      <div className="mt-7 text-center space-y-3">
        <p className="text-sm text-stone">
          New here?{" "}
          <Link
            href={`/account/signup${next !== "/profile" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-extrabold text-espresso hover:underline"
          >
            Create account
          </Link>
        </p>
        <AuthBackLink />
      </div>
    </AuthScreen>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense
      fallback={
        <AuthScreen title="Welcome back" subtitle="Loading…">
          <div className="flex justify-center py-10">
            <span className="h-8 w-8 rounded-full border-2 border-espresso/25 border-t-espresso animate-spin" />
          </div>
        </AuthScreen>
      }
    >
      <BuyerLoginForm />
    </Suspense>
  );
}
