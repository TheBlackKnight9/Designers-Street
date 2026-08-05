"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  AuthBackLink,
  AuthField,
  AuthPrimaryButton,
  AuthScreen,
} from "@/components/auth/AuthScreen";

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
    <AuthScreen
      title="Forgot Password?"
      subtitle="Enter your email and we'll send reset instructions for your Designer's Street account."
    >
      <form onSubmit={onSubmit} className="space-y-3.5">
        <AuthField
          type="email"
          icon="email"
          placeholder="email@domain.com"
          autoComplete="email"
          required
          value={email}
          onChange={setEmail}
        />

        {error && (
          <p className="text-xs text-red-700 bg-red-50 rounded-2xl px-3 py-2 font-medium">
            {error}
          </p>
        )}
        {info && (
          <p className="text-xs text-emerald-800 bg-emerald-50 rounded-2xl px-3 py-2 font-medium">
            {info}
          </p>
        )}

        <AuthPrimaryButton loading={loading}>
          {loading ? "Sending…" : "Send Reset Link"}
        </AuthPrimaryButton>
      </form>

      <div className="mt-7 text-center space-y-3">
        <p className="text-sm text-stone">
          Remembered it?{" "}
          <Link
            href="/account/login"
            className="font-extrabold text-[var(--newme-green-dark)] hover:underline"
          >
            Sign In
          </Link>
        </p>
        <AuthBackLink />
      </div>
    </AuthScreen>
  );
}
