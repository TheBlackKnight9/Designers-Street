"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [houseName, setHouseName] = useState("");
  const [handle, setHandle] = useState("");
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
      const { data, error: signError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            house_name: houseName.trim(),
            role: "designer",
          },
        },
      });
      if (signError) throw signError;
      if (!data.session) {
        setError(
          "Check your email to confirm your account, then sign in. (If email confirmation is disabled in Supabase, try signing in now.)"
        );
        setLoading(false);
        return;
      }

      const boot = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          houseName: houseName.trim() || name.trim(),
          handle: handle.trim() || undefined,
        }),
      });
      const body = await boot.json();
      if (!boot.ok || body?.ok === false) {
        throw new Error(body?.error?.message || "Account setup failed");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] bg-chip border border-espresso/10 px-6 py-8 shadow-[0_8px_40px_rgba(42,31,24,0.1)]">
        <p className="text-xs tracking-label uppercase text-stone mb-2">
          Designer&apos;s Street
        </p>
        <h1 className="font-display text-3xl text-charcoal mb-2">
          Join as a designer
        </h1>
        <p className="text-sm text-stone mb-8">
          Create your house profile and start uploading products.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs tracking-label uppercase text-stone">
              Your name
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>
          <label className="block">
            <span className="text-xs tracking-label uppercase text-stone">
              House / brand name
            </span>
            <input
              required
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>
          <label className="block">
            <span className="text-xs tracking-label uppercase text-stone">
              Handle (optional)
            </span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="your-house"
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>
          <label className="block">
            <span className="text-xs tracking-label uppercase text-stone">
              Email
            </span>
            <input
              type="email"
              required
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
            className="w-full rounded-full bg-espresso text-chip py-3 text-sm tracking-wide shadow-[0_6px_16px_rgba(42,31,24,0.28)] disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone">
          Already have an account?{" "}
          <Link href="/login" className="text-charcoal underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
