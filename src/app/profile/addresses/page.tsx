"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import {
  getIndianStates,
  getCitiesForState,
  lookupByPincode,
} from "@/lib/data/india-locations";

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

const emptyForm = {
  label: "Home",
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

export default function ProfileAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function reload() {
    try {
      const res = await fetch("/api/profile/addresses");
      const body = await res.json();
      if (res.ok && body?.ok && Array.isArray(body.data?.addresses)) {
        setAddresses(body.data.addresses);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  // Instant Offline + Online PIN Code Auto-Fill
  async function handlePostalCodeChange(code: string) {
    const clean = code.replace(/\D/g, "").slice(0, 6);
    setForm((f) => ({ ...f, postalCode: clean }));

    // 1. Instant offline lookup
    const localResult = lookupByPincode(clean);
    if (localResult) {
      setForm((f) => ({
        ...f,
        city: f.city || localResult.city,
        state: f.state || localResult.state,
      }));
    }

    // 2. Online India Post API fallback enhancement
    if (clean.length === 6) {
      setPinLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        const data = await res.json();
        if (
          Array.isArray(data) &&
          data[0]?.Status === "Success" &&
          data[0]?.PostOffice?.length > 0
        ) {
          const po = data[0].PostOffice[0];
          setForm((f) => ({
            ...f,
            city: po.District || po.Name || f.city,
            state: po.State || f.state,
          }));
        }
      } catch {
        /* Postal API fallback */
      } finally {
        setPinLoading(false);
      }
    }
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  }

  function startEdit(a: Address) {
    setEditingId(a.id);
    setForm({
      label: a.label || "Home",
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
    setError(null);
    setShowModal(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.fullName.trim()) return setError("Full name is required.");
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length !== 10) {
      return setError("Valid 10-digit mobile number is required.");
    }
    if (!form.postalCode || form.postalCode.length !== 6) {
      return setError("Valid 6-digit Indian PIN code is required.");
    }
    if (!form.line1.trim()) return setError("Flat, House No., Building/Street is required.");
    if (!form.city.trim()) return setError("City is required.");
    if (!form.state.trim()) return setError("State is required.");

    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/profile/addresses/${editingId}` : "/api/profile/addresses",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        throw new Error(body?.error?.message || "Failed to save address");
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, { method: "DELETE" });
      if (res.ok) await reload();
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-24 px-4 pt-5 max-w-2xl mx-auto">
        <Link href="/profile" className="text-xs text-stone hover:text-charcoal font-semibold">
          ← Back to Account
        </Link>

        <div className="flex items-center justify-between mt-3 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-charcoal">
              Address Book
            </h1>
            <p className="text-xs text-stone">Manage saved delivery addresses for express checkout</p>
          </div>
          <button
            type="button"
            onClick={startAdd}
            className="px-4 py-2 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-black transition-colors"
          >
            + Add Address
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-28 bg-mist animate-pulse rounded-2xl" />
            <div className="h-28 bg-mist animate-pulse rounded-2xl" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-cloud bg-white/60 space-y-3">
            <p className="text-sm font-semibold text-charcoal">No saved addresses</p>
            <p className="text-xs text-stone">Add your delivery address to enjoy 1-click checkout</p>
            <button
              type="button"
              onClick={startAdd}
              className="px-5 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full inline-block"
            >
              Add First Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`p-5 rounded-2xl border bg-white transition-all shadow-xs relative ${
                  a.isDefault ? "border-charcoal ring-1 ring-charcoal/10" : "border-cloud"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-mist text-charcoal text-[10px] font-bold uppercase tracking-wider rounded-md border border-cloud">
                      {a.label || "Home"}
                    </span>
                    {a.isDefault && (
                      <span className="px-2.5 py-0.5 bg-gold/20 text-gold-dark text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-gold/30">
                        ★ Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(a)}
                      className="text-xs font-bold text-charcoal underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(a.id)}
                      className="text-xs text-stone hover:text-red-700 underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="font-sans text-sm font-bold text-charcoal">{a.fullName}</p>
                <p className="font-sans text-xs text-stone leading-relaxed mt-1">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                  <br />
                  {a.city}, {a.state} - <span className="font-bold text-charcoal">{a.postalCode}</span>
                </p>
                {a.phone && (
                  <p className="font-sans text-xs text-stone mt-2">
                    Phone: <span className="font-semibold text-charcoal">+91 {a.phone}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Address Modal / Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 shadow-xl border border-cloud">
              <div className="flex items-center justify-between border-b border-cloud pb-3">
                <h2 className="font-display text-lg font-bold uppercase text-charcoal">
                  {editingId ? "Edit Delivery Address" : "Add Delivery Address"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-stone hover:text-charcoal font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-700 bg-red-50 rounded-xl p-3 font-medium">
                  {error}
                </p>
              )}

              <form onSubmit={onSubmit} className="space-y-3">
                {/* Type Selection */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone block mb-1">
                    Address Type
                  </span>
                  <div className="flex gap-2">
                    {["Home", "Work", "Other"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, label: type }))}
                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl border transition-colors ${
                          form.label === type
                            ? "bg-charcoal text-paper border-charcoal"
                            : "bg-mist text-stone border-cloud"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                    Full Name *
                  </span>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="Receiver Name"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                    10-Digit Mobile Phone *
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-2.5 bg-cloud/50 border border-cloud rounded-xl text-xs font-bold text-stone">
                      +91
                    </span>
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        }))
                      }
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                </label>

                {/* PIN Code with Auto-fill */}
                <label className="block relative">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone flex items-center justify-between">
                    <span>Pincode (6 digits) *</span>
                    {pinLoading && <span className="text-gold animate-pulse">Fetching city/state…</span>}
                  </span>
                  <input
                    required
                    maxLength={6}
                    value={form.postalCode}
                    onChange={(e) => handlePostalCodeChange(e.target.value)}
                    placeholder="e.g. 110001"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40 font-mono font-bold tracking-wider"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                      State *
                    </span>
                    <select
                      required
                      value={form.state}
                      onChange={(e) => setForm((f) => ({ ...f, state: e.target.value, city: "" }))}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40 font-semibold"
                    >
                      <option value="">Select State...</option>
                      {getIndianStates().map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                      City *
                    </span>
                    {getCitiesForState(form.state).length > 0 ? (
                      <select
                        required
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-cloud bg-mist px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40 font-semibold"
                      >
                        <option value="">Select City...</option>
                        {getCitiesForState(form.state).map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        required
                        value={form.city}
                        placeholder="Enter City"
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                      />
                    )}
                  </label>
                </div>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                    Address Line 1 (Flat, House No., Building, Street) *
                  </span>
                  <input
                    required
                    value={form.line1}
                    onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                    placeholder="123 Luxury Avenue, Penthouse B"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                    Address Line 2 (Landmark / Area)
                  </span>
                  <input
                    value={form.line2}
                    onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
                    placeholder="Near Grand Galleria"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </label>

                <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-charcoal">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                    className="rounded text-charcoal accent-charcoal"
                  />
                  Set as Default Delivery Address
                </label>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-cloud text-stone text-xs font-bold uppercase rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-charcoal text-paper text-xs font-bold uppercase rounded-full shadow-sm disabled:opacity-60"
                  >
                    {saving ? "Saving Address…" : editingId ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
