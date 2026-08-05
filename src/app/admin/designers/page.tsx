"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/Toast";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  getIndianStates,
  getCitiesForState,
} from "@/lib/data/india-locations";
import { Search, Plus, ExternalLink, ShieldCheck, AlertCircle, X } from "lucide-react";

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
  name: "",
  handle: "",
  bio: "",
  logo: "",
  banner: "",
  state: "",
  city: "",
  bankBeneficiary: "",
  bankAccount: "",
  bankIfsc: "",
  bankName: "",
  gstin: "",
  pan: "",
  shippingPincode: "",
  shippingCity: "",
  shippingState: "",
  shippingAddress: "",
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
    <div className="space-y-6">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Designer Houses"
        subtitle={`${houses.filter((h) => h.accountStatus === "active").length} registered atelier fashion houses`}
        actionButton={{
          label: "New House",
          href: "",
          onClick: () => {
            setForm(EMPTY_FORM);
            setShowModal(true);
          },
        }}
      />

      {/* Search + Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search by house name or @handle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#ECE8DC] bg-white pl-10 pr-4 py-2 text-xs outline-none focus:border-[#17181D] font-medium shadow-2xs"
          />
        </div>

        <div className="flex bg-white p-1 rounded-full border border-[#ECE8DC] shadow-2xs">
          {(["active", "suspended"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
                activeTab === t
                  ? "bg-[#17181D] text-white shadow-xs"
                  : "text-[#8A8A8A] hover:text-[#1A1A1A]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Houses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/70 animate-pulse border border-[#ECE8DC]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#ECE8DC] rounded-2xl bg-white">
          <p className="text-sm font-bold text-[#1A1A1A]">No designer houses found</p>
          <p className="text-xs text-[#8A8A8A] mt-1 font-medium">
            {activeTab === "active" ? "Click '+ New House' to register your first designer house." : "No suspended designer houses."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="bg-white border border-[#ECE8DC] rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* House Header */}
                <div className="flex items-center gap-3">
                  {h.logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={h.logo}
                      alt={h.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#ECE8DC] shadow-2xs flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#17181D] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {h.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-[#1A1A1A] truncate">{h.name}</p>
                      {h.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#8A8A8A] font-mono">@{h.handle}</p>
                  </div>

                  <AdminStatusBadge status={h.accountStatus} />
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 text-center bg-[#F4F0E5]/60 rounded-xl p-2.5 text-xs mt-4 border border-[#ECE8DC]">
                  <div>
                    <p className="font-bold font-mono text-[#1A1A1A]">{h._count.products}</p>
                    <p className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Products</p>
                  </div>
                  <div>
                    <p className="font-bold font-mono text-[#1A1A1A]">{h._count.orders}</p>
                    <p className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Orders</p>
                  </div>
                  <div>
                    <p className="font-bold font-mono text-[#1A1A1A]">{h.commissionRate ?? 10}%</p>
                    <p className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Commission</p>
                  </div>
                </div>

                {/* Finance Chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {h.gstin && (
                    <span className="text-[10px] bg-[#F4F0E5] border border-[#ECE8DC] px-2 py-0.5 rounded-full font-mono text-[#1A1A1A]">
                      GST: {h.gstin}
                    </span>
                  )}
                  {h.bankAccount && (
                    <span className="text-[10px] bg-[#F4F0E5] border border-[#ECE8DC] px-2 py-0.5 rounded-full font-mono text-[#1A1A1A]">
                      A/C: ****{h.bankAccount.slice(-4)}
                    </span>
                  )}
                  {h.returnPincode && (
                    <span className="text-[10px] bg-[#F4F0E5] border border-[#ECE8DC] px-2 py-0.5 rounded-full font-mono text-[#1A1A1A]">
                      PIN: {h.returnPincode}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#ECE8DC]">
                <button
                  type="button"
                  onClick={() => handleSelectHouse(h.id)}
                  className="flex-1 py-2.5 bg-[#F6D746] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#F6D746]/90 transition-all shadow-2xs text-center flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  Studio
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSuspend(h.id, h.accountStatus === "active")}
                  className="px-3 py-2.5 border border-[#ECE8DC] text-xs font-bold uppercase rounded-full text-[#8A8A8A] hover:bg-[#F2A6A6]/20 hover:text-red-700 transition-colors"
                >
                  {h.accountStatus === "active" ? "Suspend" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#ECE8DC]">
            <div className="sticky top-0 bg-white border-b border-[#ECE8DC] px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="font-display text-lg font-bold uppercase text-[#1A1A1A]">
                  Register Designer House
                </h2>
                <p className="text-[11px] text-[#8A8A8A]">Fields marked * are required for payouts & onboarding</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4F0E5] text-[#1A1A1A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6 text-xs font-sans">
              {/* Brand Identity */}
              <section className="space-y-3">
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-[#8A8A8A] border-b border-[#ECE8DC] pb-1">
                  Brand Identity
                </h3>

                <label className="block">
                  <span className="font-bold uppercase text-[#8A8A8A]">Brand Name *</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => {
                      f("name", e.target.value);
                      if (!form.handle) {
                        f("handle", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                      }
                    }}
                    placeholder="Noir Structure"
                    className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] px-4 py-2.5 outline-none font-bold"
                  />
                </label>

                <label className="block">
                  <span className="font-bold uppercase text-[#8A8A8A]">Handle (URL slug) *</span>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="px-3 py-2.5 bg-[#ECE8DC] rounded-xl font-bold text-[#8A8A8A]">@</span>
                    <input
                      required
                      value={form.handle}
                      onChange={(e) => f("handle", e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                      placeholder="noir-structure"
                      className="flex-1 rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] px-4 py-2.5 outline-none font-mono"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="font-bold uppercase text-[#8A8A8A]">Bio / Description</span>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => f("bio", e.target.value)}
                    placeholder="Luxury Indian couture redefining contemporary bridal fashion…"
                    className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] px-4 py-2.5 outline-none resize-none"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="font-bold uppercase text-[#8A8A8A]">Logo URL</span>
                    <input
                      type="url"
                      value={form.logo}
                      onChange={(e) => f("logo", e.target.value)}
                      placeholder="https://…/logo.jpg"
                      className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] px-4 py-2.5 outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="font-bold uppercase text-[#8A8A8A]">Banner URL</span>
                    <input
                      type="url"
                      value={form.banner}
                      onChange={(e) => f("banner", e.target.value)}
                      placeholder="https://…/banner.jpg"
                      className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] px-4 py-2.5 outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="font-bold uppercase text-[#8A8A8A]">State</span>
                    <select
                      value={form.state}
                      onChange={(e) => { f("state", e.target.value); f("city", ""); }}
                      className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] px-3 py-2.5 outline-none font-bold"
                    >
                      <option value="">Select State…</option>
                      {getIndianStates().map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-bold uppercase text-[#8A8A8A]">City</span>
                    {getCitiesForState(form.state).length > 0 ? (
                      <select
                        value={form.city}
                        onChange={(e) => f("city", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] px-3 py-2.5 outline-none font-bold"
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
                        className="mt-1 w-full rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] px-4 py-2.5 outline-none"
                      />
                    )}
                  </label>
                </div>
              </section>

              {/* Commission Rate */}
              <section className="space-y-3">
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-[#8A8A8A] border-b border-[#ECE8DC] pb-1">
                  Commission Rate (%)
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="0.5"
                    value={form.commissionRate}
                    onChange={(e) => f("commissionRate", e.target.value)}
                    className="flex-1 accent-[#17181D]"
                  />
                  <span className="w-14 text-center font-bold font-mono text-[#1A1A1A] bg-[#F4F0E5] border border-[#ECE8DC] rounded-xl px-2 py-1">
                    {form.commissionRate}%
                  </span>
                </div>
              </section>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-[#ECE8DC] text-[#8A8A8A] font-bold uppercase rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#F6D746] text-[#1A1A1A] font-bold uppercase rounded-full shadow-sm hover:bg-[#F6D746]/90 disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Registering…" : "Register House →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
