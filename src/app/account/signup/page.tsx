"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AccountSignupPage() {
  const router = useRouter();
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
              ? `${window.location.origin}/account/login`
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

      router.replace("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-cloud rounded-3xl p-8 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest uppercase text-stone mb-1">
          Designer&apos;s Street
        </p>
        <h1 className="font-display text-3xl font-bold text-charcoal mb-1">
          Create Account
        </h1>
        <p className="text-xs text-stone mb-6">
          Save wishlist, cart, and track orders across devices.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Full Name
            </span>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 rounded-xl px-3 py-2 font-medium">
              {error}
            </p>
          )}
          {info && (
            <p className="text-xs text-emerald-800 bg-emerald-50 rounded-xl px-3 py-2 font-medium">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-charcoal text-paper py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-60 shadow-sm"
          >
            {loading ? "Creating Account…" : "Create Buyer Account"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cloud/60 text-center space-y-2 text-xs text-stone">
          <p>
            Already have an account?{" "}
            <Link href="/account/login" className="text-charcoal font-bold underline">
              Sign in
            </Link>
          </p>
          <p>
            <Link href="/" className="text-stone hover:text-charcoal">
              ← Back to shop
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
