"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/Toast";
import {
  getIndianStates,
  getCitiesForState,
} from "@/lib/data/india-locations";

type House = {
  id: string;
  name: string;
  handle: string;
  logo: string;
  location: string;
  verified: boolean;
  accountStatus: string;
  commissionRate: number | null;
  gstin: string | null;
  pan: string | null;
  bankBeneficiary: string | null;
  bankAccount: string | null;
  bankIfsc: string | null;
  bankName: string | null;
  returnPincode: string | null;
  _count: { products: number; posts: number; orders: number };
};

const EMPTY_FORM = {
  // Basic
  name: "",
  handle: "",
  bio: "",
  // Media
  logo: "",
  banner: "",
  // Location
  state: "",
  city: "",
  // Bank
  bankBeneficiary: "",
  bankAccount: "",
  bankIfsc: "",
  bankName: "",
  // Tax
  gstin: "",
  pan: "",
  // Shipping origin
  shippingPincode: "",
  shippingCity: "",
  shippingState: "",
  shippingAddress: "",
  // Financial
  commissionRate: "10",
};

export default function AdminDesignersPage() {
  const router = useRouter();
  const { push } = useToast();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "suspended">("active");

  function f(k: keyof typeof EMPTY_FORM, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  useEffect(() => {
    reload();
  }, []);

  async function reload() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/designers");
      const body = await res.json();
      if (body?.ok && Array.isArray(body.data?.houses)) {
        setHouses(body.data.houses);
      } else {
        push("Failed to load houses", "err");
      }
    } catch {
      push("Network error", "err");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectHouse(houseId: string) {
    document.cookie = `admin_active_designer_id=${houseId}; path=/; max-age=86400`;
    push("✅ Active house switched!", "ok");
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSuspend(id: string, suspend: boolean) {
    if (!confirm(suspend ? "Suspend this house?" : "Reactivate this house?")) return;
    try {
      const res = await fetch(`/api/admin/designers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus: suspend ? "suspended" : "active" }),
      });
      const body = await res.json();
      if (body?.ok) {
        push(suspend ? "House suspended" : "House reactivated", "ok");
        await reload();
      } else {
        push(body?.error?.message || "Failed", "err");
      }
    } catch {
      push("Network error", "err");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return push("House name is required", "err");

    const handle =
      form.handle.trim() ||
      form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/designers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          handle,
          commissionRate: parseFloat(form.commissionRate) || 10,
        }),
      });
      const body = await res.json();
      if (res.ok && body?.ok) {
        push(`🏛️ "${form.name}" created!`, "ok");
        setShowModal(false);
        setForm(EMPTY_FORM);
        await reload();
      } else {
        push(body?.error?.message || "Creation failed", "err");
      }
    } catch {
      push("Network error", "err");
    } finally {
      setSaving(false);
    }
  }

  const filtered = houses
    .filter((h) =>
      activeTab === "active"
        ? h.accountStatus === "active"
        : h.accountStatus === "suspended"
    )
    .filter(
      (h) =>
        !search ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.handle.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone">Admin</p>
          <h1 className="font-display text-2xl font-bold uppercase text-charcoal">
            Designer Houses
          </h1>
          <p className="text-xs text-stone">{houses.filter(h => h.accountStatus === "active").length} active houses</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}
          className="px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black shadow-sm transition-colors"
        >
          + Create New House
        </button>
      </div>

      {/* Search + Tabs */}
      <div className="flex gap-3 items-center">
        <input
          type="search"
          placeholder="Search by name or @handle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-cloud bg-white px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40"
        />
        <div className="flex border border-cloud rounded-xl overflow-hidden">
          {(["active", "suspended"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-xs font-bold uppercase transition-colors ${
                activeTab === t ? "bg-charcoal text-paper" : "bg-white text-stone"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Houses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-mist animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-cloud rounded-3xl">
          <p className="text-sm font-bold text-charcoal">No houses found</p>
          <p className="text-xs text-stone mt-1">
            {activeTab === "active" ? "Create your first designer house." : "No suspended houses."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="bg-white border border-cloud rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-sm transition-shadow"
            >
              {/* House Header */}
              <div className="flex items-center gap-3">
                {h.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={h.logo}
                    alt={h.name}
                    className="w-10 h-10 rounded-full object-cover border border-cloud"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-charcoal truncate">{h.name}</p>
                  <p className="text-[11px] text-stone">@{h.handle}</p>
                </div>
                <div className="flex items-center gap-1">
                  {h.verified && (
                    <span className="text-[10px] bg-gold/20 text-gold-dark font-bold px-2 py-0.5 rounded-md border border-gold/30">
                      ✓ Verified
                    </span>
                  )}
                  {h.accountStatus === "suspended" && (
                    <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md border border-red-200">
                      Suspended
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center bg-mist/40 rounded-xl p-2 text-[11px]">
                <div>
                  <p className="font-bold text-charcoal">{h._count.products}</p>
                  <p className="text-stone">Products</p>
                </div>
                <div>
                  <p className="font-bold text-charcoal">{h._count.orders}</p>
                  <p className="text-stone">Orders</p>
                </div>
                <div>
                  <p className="font-bold text-charcoal">{h.commissionRate ?? 10}%</p>
                  <p className="text-stone">Commission</p>
                </div>
              </div>

              {/* Finance Chips */}
              <div className="flex flex-wrap gap-1.5">
                {h.gstin && (
                  <span className="text-[10px] bg-mist border border-cloud px-2 py-0.5 rounded font-mono">
                    GST: {h.gstin}
                  </span>
                )}
                {h.bankAccount && (
                  <span className="text-[10px] bg-mist border border-cloud px-2 py-0.5 rounded font-mono">
                    A/C: ****{h.bankAccount.slice(-4)}
                  </span>
                )}
                {h.returnPincode && (
                  <span className="text-[10px] bg-mist border border-cloud px-2 py-0.5 rounded">
                    📦 PIN: {h.returnPincode}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleSelectHouse(h.id)}
                  className="flex-1 py-2 bg-charcoal text-paper text-xs font-bold uppercase rounded-xl hover:bg-black transition-colors"
                >
                  Switch & Open Studio →
                </button>
                <button
                  onClick={() => handleSuspend(h.id, h.accountStatus === "active")}
                  className="px-3 py-2 border border-cloud text-xs font-bold uppercase rounded-xl text-stone hover:border-red-300 hover:text-red-700 transition-colors"
                >
                  {h.accountStatus === "active" ? "Suspend" : "Reactivate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-cloud">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-cloud px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="font-display text-lg font-bold uppercase text-charcoal">
                  Create Designer House
                </h2>
                <p className="text-[11px] text-stone">All fields marked * are required</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone hover:text-charcoal font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6 text-xs">
              {/* ── SECTION: Brand Identity ── */}
              <section className="space-y-3">
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-stone border-b border-cloud pb-1">
                  Brand Identity
                </h3>

                <label className="block">
                  <span className="font-bold uppercase text-stone">Brand Name *</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => {
                      f("name", e.target.value);
                      if (!form.handle) {
                        f(
                          "handle",
                          e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                        );
                      }
                    }}
                    placeholder="Noir Structure"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40 font-semibold"
                  />
                </label>

                <label className="block">
                  <span className="font-bold uppercase text-stone">Handle (URL slug) *</span>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="px-3 py-2.5 bg-cloud/50 border border-cloud rounded-xl font-bold text-stone">@</span>
                    <input
                      required
                      value={form.handle}
                      onChange={(e) =>
                        f("handle", e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))
                      }
                      placeholder="noir-structure"
                      className="flex-1 rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40 font-mono"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="font-bold uppercase text-stone">Bio / Brand Description</span>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => f("bio", e.target.value)}
                    placeholder="Luxury Indian couture redefining contemporary bridal fashion…"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="font-bold uppercase text-stone">Logo URL</span>
                    <input
                      type="url"
                      value={form.logo}
                      onChange={(e) => f("logo", e.target.value)}
                      placeholder="https://…/logo.jpg"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </label>
                  <label className="block">
                    <span className="font-bold uppercase text-stone">Banner URL</span>
                    <input
                      type="url"
                      value={form.banner}
                      onChange={(e) => f("banner", e.target.value)}
                      placeholder="https://…/banner.jpg"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </label>
                </div>

                {/* State + City */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="font-bold uppercase text-stone">State</span>
                    <select
                      value={form.state}
                      onChange={(e) => { f("state", e.target.value); f("city", ""); }}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-3 py-2.5 outline-none focus:ring-2 focus:ring-gold/40"
                    >
                      <option value="">Select State…</option>
                      {getIndianStates().map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-bold uppercase text-stone">City</span>
                    {getCitiesForState(form.state).length > 0 ? (
                      <select
                        value={form.city}
                        onChange={(e) => f("city", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-cloud bg-mist px-3 py-2.5 outline-none focus:ring-2 focus:ring-gold/40"
                      >
                        <option value="">Select City…</option>
                        {getCitiesForState(form.state).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={form.city}
                        onChange={(e) => f("city", e.target.value)}
                        placeholder="City / District"
                        className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40"
                      />
                    )}
                  </label>
                </div>
              </section>

              {/* ── SECTION: Shipping Origin ── */}
              <section className="space-y-3">
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-stone border-b border-cloud pb-1">
                  Shipping Origin (Pickup Address)
                </h3>
                <label className="block">
                  <span className="font-bold uppercase text-stone">Street Address</span>
                  <input
                    value={form.shippingAddress}
                    onChange={(e) => f("shippingAddress", e.target.value)}
                    placeholder="Studio 4B, Sanganer Industrial Area"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="block">
                    <span className="font-bold uppercase text-stone">PIN Code</span>
                    <input
                      maxLength={6}
                      value={form.shippingPincode}
                      onChange={(e) => f("shippingPincode", e.target.value.replace(/\D/g, ""))}
                      placeholder="302021"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40 font-mono tracking-wider"
                    />
                  </label>
                  <label className="block">
                    <span className="font-bold uppercase text-stone">City</span>
                    <input
                      value={form.shippingCity}
                      onChange={(e) => f("shippingCity", e.target.value)}
                      placeholder="Jaipur"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </label>
                  <label className="block">
                    <span className="font-bold uppercase text-stone">State</span>
                    <input
                      value={form.shippingState}
                      onChange={(e) => f("shippingState", e.target.value)}
                      placeholder="Rajasthan"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </label>
                </div>
              </section>

              {/* ── SECTION: Bank Details ── */}
              <section className="space-y-3">
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-stone border-b border-cloud pb-1">
                  Bank Details (for Payouts)
                </h3>
                <label className="block">
                  <span className="font-bold uppercase text-stone">Beneficiary Name</span>
                  <input
                    value={form.bankBeneficiary}
                    onChange={(e) => f("bankBeneficiary", e.target.value)}
                    placeholder="NOIR STRUCTURE DESIGNS LLP"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="font-bold uppercase text-stone">Account Number</span>
                    <input
                      value={form.bankAccount}
                      onChange={(e) => f("bankAccount", e.target.value.replace(/\D/g, ""))}
                      placeholder="000901234567890"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40 font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="font-bold uppercase text-stone">IFSC Code</span>
                    <input
                      value={form.bankIfsc}
                      onChange={(e) => f("bankIfsc", e.target.value.toUpperCase())}
                      placeholder="HDFC0001234"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40 font-mono tracking-wider"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="font-bold uppercase text-stone">Bank Name</span>
                  <input
                    value={form.bankName}
                    onChange={(e) => f("bankName", e.target.value)}
                    placeholder="HDFC Bank"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </label>
              </section>

              {/* ── SECTION: Tax & Commission ── */}
              <section className="space-y-3">
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-stone border-b border-cloud pb-1">
                  Tax Details & Commission
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="font-bold uppercase text-stone">GSTIN</span>
                    <input
                      value={form.gstin}
                      onChange={(e) => f("gstin", e.target.value.toUpperCase())}
                      placeholder="27AABCU9603R1ZX"
                      maxLength={15}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40 font-mono tracking-wider"
                    />
                  </label>
                  <label className="block">
                    <span className="font-bold uppercase text-stone">PAN</span>
                    <input
                      value={form.pan}
                      onChange={(e) => f("pan", e.target.value.toUpperCase())}
                      placeholder="AABCU9603R"
                      maxLength={10}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40 font-mono tracking-wider"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="font-bold uppercase text-stone">
                    Platform Commission Rate (%) *
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="0.5"
                      value={form.commissionRate}
                      onChange={(e) => f("commissionRate", e.target.value)}
                      className="flex-1 accent-charcoal"
                    />
                    <span className="w-14 text-center font-bold font-mono text-charcoal bg-mist border border-cloud rounded-xl px-2 py-1">
                      {form.commissionRate}%
                    </span>
                  </div>
                </label>
              </section>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-cloud text-stone font-bold uppercase rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-charcoal text-paper font-bold uppercase rounded-full shadow-sm disabled:opacity-60 hover:bg-black transition-colors"
                >
                  {saving ? "Creating House…" : "🏛️ Create Designer House"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
