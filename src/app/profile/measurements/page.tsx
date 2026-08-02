"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { useToast } from "@/components/dashboard/Toast";

type Profile = {
  id: string;
  name: string;
  unit: string;
  isDefault: boolean;
  height: number | null;
  chest: number | null;
  waist: number | null;
  hip: number | null;
  shoulder: number | null;
  sleeve: number | null;
  notes: string | null;
};

export default function ProfileMeasurementsPage() {
  const { push } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "My Bridal Fit",
    unit: "inches",
    isDefault: false,
    height: "",
    chest: "",
    waist: "",
    hip: "",
    shoulder: "",
    sleeve: "",
    notes: "",
  });

  async function reload() {
    try {
      const res = await fetch("/api/account/measurements");
      const data = await res.json();
      if (res.ok && data?.ok && Array.isArray(data.data?.profiles)) {
        setProfiles(data.data.profiles);
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

  function startAdd() {
    setEditingId(null);
    setForm({
      name: "My Custom Fit",
      unit: "inches",
      isDefault: profiles.length === 0,
      height: "",
      chest: "",
      waist: "",
      hip: "",
      shoulder: "",
      sleeve: "",
      notes: "",
    });
    setShowModal(true);
  }

  function startEdit(p: Profile) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      unit: p.unit || "inches",
      isDefault: p.isDefault,
      height: p.height ? String(p.height) : "",
      chest: p.chest ? String(p.chest) : "",
      waist: p.waist ? String(p.waist) : "",
      hip: p.hip ? String(p.hip) : "",
      shoulder: p.shoulder ? String(p.shoulder) : "",
      sleeve: p.sleeve ? String(p.sleeve) : "",
      notes: p.notes || "",
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(
        editingId ? `/api/account/measurements/${editingId}` : "/api/account/measurements",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok && data?.ok) {
        push("Measurement profile saved!", "ok");
        setShowModal(false);
        await reload();
      } else {
        push(data?.error?.message || "Failed to save profile", "err");
      }
    } catch {
      push("Save error", "err");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this profile?")) return;
    try {
      const res = await fetch(`/api/account/measurements/${id}`, { method: "DELETE" });
      if (res.ok) {
        push("Profile deleted", "ok");
        await reload();
      }
    } catch {
      push("Failed to delete profile", "err");
    }
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-24 px-4 pt-5 max-w-3xl mx-auto space-y-6">
        <Link href="/profile" className="text-xs text-stone hover:text-charcoal font-semibold">
          ← Back to Account
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-charcoal">
              Saved Measurement Profiles
            </h1>
            <p className="text-xs text-stone">
              Save custom fits for instant size recommendations and bespoke tailoring orders.
            </p>
          </div>
          <button
            onClick={startAdd}
            className="px-4 py-2 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-black"
          >
            + Add Profile
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-stone">Loading profiles…</div>
        ) : profiles.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border border-cloud bg-white/80 space-y-4">
            <p className="font-bold text-sm text-charcoal">No saved measurement profiles</p>
            <p className="text-xs text-stone max-w-sm mx-auto">
              Create your measurement profile (e.g. Bust, Waist, Hips, Height) to receive automatic size match recommendations on all product pages!
            </p>
            <button
              onClick={startAdd}
              className="px-6 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase rounded-full shadow-sm"
            >
              Create My First Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map((p) => (
              <div key={p.id} className="p-5 bg-white border border-cloud rounded-3xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-charcoal">{p.name}</h3>
                    {p.isDefault && (
                      <span className="text-[10px] bg-gold/20 text-gold-dark font-extrabold px-2 py-0.5 rounded-md border border-gold/30">
                        ★ DEFAULT
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-stone">Unit: {p.unit}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-mist/40 rounded-2xl border border-cloud/40 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-stone block font-semibold">Bust/Chest</span>
                    <span className="font-bold text-charcoal">{p.chest ? `${p.chest}"` : "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone block font-semibold">Waist</span>
                    <span className="font-bold text-charcoal">{p.waist ? `${p.waist}"` : "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone block font-semibold">Hips</span>
                    <span className="font-bold text-charcoal">{p.hip ? `${p.hip}"` : "-"}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    onClick={() => startEdit(p)}
                    className="text-xs font-bold text-charcoal underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs font-semibold text-stone hover:text-red-700 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-xl border border-cloud">
              <div className="flex items-center justify-between border-b border-cloud pb-3">
                <h2 className="font-display text-lg font-bold uppercase text-charcoal">
                  {editingId ? "Edit Measurement Profile" : "Create Measurement Profile"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-stone font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <label className="block">
                  <span className="font-bold uppercase text-stone">Profile Name *</span>
                  <input
                    required
                    placeholder="e.g. My Bridal Fit, Mom's Measurements"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none font-semibold"
                  />
                </label>

                <div>
                  <span className="font-bold uppercase text-stone block mb-1">Measurement Unit</span>
                  <div className="flex gap-2">
                    {["inches", "cm"].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setForm({ ...form, unit: u })}
                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl border ${
                          form.unit === u ? "bg-charcoal text-paper border-charcoal" : "bg-mist text-stone"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="font-bold uppercase text-stone">Bust / Chest ({form.unit})</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 34"
                      value={form.chest}
                      onChange={(e) => setForm({ ...form, chest: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="font-bold uppercase text-stone">Waist ({form.unit})</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 28"
                      value={form.waist}
                      onChange={(e) => setForm({ ...form, waist: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="font-bold uppercase text-stone">Hips ({form.unit})</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 38"
                      value={form.hip}
                      onChange={(e) => setForm({ ...form, hip: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="font-bold uppercase text-stone">Shoulder Width ({form.unit})</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 15"
                      value={form.shoulder}
                      onChange={(e) => setForm({ ...form, shoulder: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="font-bold uppercase text-stone">Arm / Sleeve Length ({form.unit})</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 22"
                      value={form.sleeve}
                      onChange={(e) => setForm({ ...form, sleeve: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="font-bold uppercase text-stone">Height ({form.unit === "inches" ? "Feet/Inches" : "CM"})</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 65 (5'5'')"
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="accent-charcoal rounded"
                  />
                  <span className="font-bold text-charcoal">Set as My Default Fit</span>
                </label>

                <div className="pt-3 flex justify-end gap-2 border-t border-cloud">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-cloud text-stone font-bold uppercase rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-charcoal text-paper font-bold uppercase rounded-full shadow-sm"
                  >
                    Save Measurement Profile
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
