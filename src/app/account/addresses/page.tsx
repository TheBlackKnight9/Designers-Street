"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

type Address = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const empty = {
  label: "",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const res = await fetch("/api/addresses");
    const body = await res.json();
    if (!res.ok || !body?.ok) throw new Error(body?.error?.message || "Failed");
    setAddresses(body.data.addresses || []);
  }

  useEffect(() => {
    reload()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, []);

  function startEdit(a: Address) {
    setEditingId(a.id);
    setForm({
      label: a.label || "",
      fullName: a.fullName,
      phone: a.phone || "",
      line1: a.line1,
      line2: a.line2 || "",
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country || "IN",
      isDefault: a.isDefault,
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(
        editingId ? `/api/addresses/${editingId}` : "/api/addresses",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        throw new Error(body?.error?.message || "Could not save");
      }
      setForm(empty);
      setEditingId(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    const body = await res.json();
    if (!res.ok || !body?.ok) {
      setError(body?.error?.message || "Delete failed");
      return;
    }
    if (editingId === id) {
      setEditingId(null);
      setForm(empty);
    }
    await reload();
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-24 px-4 pt-5">
        <Link href="/profile" className="text-xs text-stone underline">
          ← Account
        </Link>
        <h1 className="font-display text-2xl font-bold uppercase mt-3 mb-4">
          Address book
        </h1>

        {loading && <p className="text-sm text-stone">Loading…</p>}
        {error && (
          <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div className="space-y-3 mb-8">
          {addresses.map((a) => (
            <div key={a.id} className="border border-cloud rounded-xl p-4">
              <p className="text-sm font-semibold">
                {a.fullName}
                {a.isDefault ? " · Default" : ""}
              </p>
              <p className="text-xs text-stone mt-1">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city}, {a.state} {a.postalCode}
              </p>
              <button
                type="button"
                onClick={() => startEdit(a)}
                className="mt-2 mr-3 text-xs underline text-stone"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(a.id)}
                className="mt-2 text-xs underline text-stone"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <h2 className="text-xs uppercase tracking-wider text-stone mb-3">
          {editingId ? "Edit address" : "Add address"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-3">
          {(
            [
              ["fullName", "Full name"],
              ["phone", "Phone"],
              ["line1", "Line 1"],
              ["line2", "Line 2"],
              ["city", "City"],
              ["state", "State"],
              ["postalCode", "Postal code"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-xs uppercase tracking-wider text-stone">
                {label}
              </span>
              <input
                required={!["phone", "line2"].includes(key)}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm"
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm((f) => ({ ...f, isDefault: e.target.checked }))
              }
            />
            Set as default
          </label>
          <button
            type="submit"
            className="w-full h-12 bg-charcoal text-paper text-xs uppercase tracking-wider rounded-full"
          >
            {editingId ? "Update address" : "Save address"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(empty);
              }}
              className="w-full text-xs underline text-stone"
            >
              Cancel edit
            </button>
          )}
        </form>
      </main>
      <BottomNav />
    </>
  );
}
