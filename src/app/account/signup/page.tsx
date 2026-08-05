"use client";

import { FormEvent, Suspense, useState } from "react";
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

function BuyerSignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeInternalPath(params.get("next"), "/profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            role: "buyer",
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
              : undefined,
        },
      });
      if (signError) throw signError;

      if (!data.session) {
        setInfo(
          "Check your email to verify your account, then sign in. If email confirmation is disabled in Supabase, you can sign in now."
        );
        setLoading(false);
        return;
      }

      const boot = await fetch("/api/auth/buyer-bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "buyer", name: name.trim() }),
      });
      const body = await boot.json();
      if (!boot.ok || body?.ok === false) {
        throw new Error(body?.error?.message || "Account setup failed");
      }

      try {
        await fetch("/api/cart/merge", { method: "POST" });
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
        /* optional */
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ds:commerce-sync"));
      }

      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getGoogleOAuthRedirectTo(next),
          ...GOOGLE_OAUTH_OPTIONS,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-up failed";
      const hint =
        /provider is not enabled|unsupported provider/i.test(message)
          ? " Google login is not enabled yet in Supabase. Enable the Google provider in Authentication → Providers."
          : "";
      setError(message + hint);
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Join Designer's Street"
      subtitle="Continue with Google to join instantly — no password to create."
    >
      <AuthGoogleButton
        onClick={handleGoogleSignup}
        loading={loading}
        label="Continue with Google"
      />
      <p className="mt-2 text-center text-[11px] text-stone">
        One tap · we&apos;ll create your account automatically
      </p>

      {error && (
        <p className="mt-4 text-xs text-red-700 bg-red-50 rounded-2xl px-3 py-2 font-medium">
          {error}
        </p>
      )}
      {info && (
        <p className="mt-4 text-xs text-emerald-800 bg-emerald-50 rounded-2xl px-3 py-2 font-medium">
          {info}
        </p>
      )}

      <AuthDivider label="OR USE EMAIL & PASSWORD" />

      <form onSubmit={onSubmit} className="space-y-3.5" suppressHydrationWarning>
        <AuthField
          icon="user"
          placeholder="Full name"
          autoComplete="name"
          required
          value={name}
          onChange={setName}
        />
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
          placeholder="Create a password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={setPassword}
        />

        <AuthPrimaryButton loading={loading}>
          {loading ? "Creating Account…" : "Sign up with email"}
        </AuthPrimaryButton>
      </form>

      <div className="mt-7 text-center space-y-3">
        <p className="text-sm text-stone">
          Already have an account?{" "}
          <Link
            href={`/account/login${next !== "/profile" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-extrabold text-espresso hover:underline"
          >
            Sign In
          </Link>
        </p>
        <AuthBackLink />
      </div>
    </AuthScreen>
  );
}

export default function AccountSignupPage() {
  return (
    <Suspense
      fallback={
        <AuthScreen title="Join Designer's Street" subtitle="Loading…">
          <div className="flex justify-center py-10">
            <span className="h-8 w-8 rounded-full border-2 border-espresso/25 border-t-espresso animate-spin" />
          </div>
        </AuthScreen>
      }
    >
      <BuyerSignupForm />
    </Suspense>
  );
}
