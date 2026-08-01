"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default function AccountSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((body) => {
        if (!body?.ok) throw new Error(body?.error?.message || "Unauthorized");
        setName(body.data.user.name || "");
        setEmail(body.data.user.email || "");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/account/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        throw new Error(body?.error?.message || "Save failed");
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-24 px-4 pt-5">
        <Link href="/profile" className="text-xs text-stone underline">
          ← Account
        </Link>
        <h1 className="font-display text-2xl font-bold uppercase mt-3 mb-4">
          Settings
        </h1>

        {loading ? (
          <p className="text-sm text-stone">Loading…</p>
        ) : (
          <form onSubmit={onSave} className="space-y-4 max-w-md">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-stone">
                Email
              </span>
              <input
                type="email"
                disabled
                value={email}
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm opacity-70"
              />
              <span className="text-[10px] text-stone">
                Email is managed by Supabase Auth.
              </span>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-stone">
                Display name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm"
              />
            </label>
            {error && (
              <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {saved && (
              <p className="text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2">
                Profile saved.
              </p>
            )}
            <button
              type="submit"
              className="w-full h-12 bg-charcoal text-paper text-xs uppercase tracking-wider rounded-full"
            >
              Save changes
            </button>
            <Link
              href="/account/forgot-password"
              className="block text-center text-xs underline text-stone"
            >
              Change password
            </Link>
          </form>
        )}
      </main>
      <BottomNav />
    </>
  );
}
