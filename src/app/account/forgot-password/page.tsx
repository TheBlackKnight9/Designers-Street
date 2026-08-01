"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/account/reset-password`,
        }
      );
      if (resetError) throw resetError;

      setInfo("Password reset instructions have been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
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
          Reset Password
        </h1>
        <p className="text-xs text-stone mb-6">
          Enter your email address to receive password reset instructions.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
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
            {loading ? "Sending link…" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cloud/60 text-center text-xs text-stone">
          <Link href="/account/login" className="text-charcoal font-bold underline">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
