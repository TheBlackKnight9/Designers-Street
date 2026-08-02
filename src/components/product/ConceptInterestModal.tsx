"use client";

import { useState, useEffect } from "react";

export function ConceptInterestModal({
  product,
  onClose,
}: {
  product: { id: string; name: string };
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    budgetRange: "₹50,000 – ₹1,00,000",
    chest: "",
    waist: "",
    hip: "",
    height: "",
    notes: "",
  });

  const [useSavedProfile, setUseSavedProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/account/measurements")
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data.data?.profiles) && data.data.profiles.length > 0) {
          const def = data.data.profiles.find((p: any) => p.isDefault) || data.data.profiles[0];
          setSavedProfile(def);
        }
      })
      .catch(() => undefined);
  }, []);

  function handleToggleSavedProfile(checked: boolean) {
    setUseSavedProfile(checked);
    if (checked && savedProfile) {
      setForm((f) => ({
        ...f,
        chest: savedProfile.chest ? String(savedProfile.chest) : f.chest,
        waist: savedProfile.waist ? String(savedProfile.waist) : f.waist,
        hip: savedProfile.hip ? String(savedProfile.hip) : f.hip,
        height: savedProfile.height ? String(savedProfile.height) : f.height,
        notes: f.notes || `Attached Saved Profile: ${savedProfile.name}`,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/concept-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          ...form,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        alert("Bespoke inquiry submitted successfully! The atelier will contact you shortly.");
        onClose();
      } else {
        alert(data?.error?.message || "Failed to submit inquiry");
      }
    } catch {
      alert("Error submitting inquiry");
    } finally {
      setSubmitting(false);
    }
  }

  const field = "w-full rounded-xl border border-cloud bg-mist p-3 text-xs outline-none focus:ring-2 focus:ring-charcoal/20 font-medium";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-cloud pb-3">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-stone block">🎨 Concept Art Showcase</span>
            <h3 className="font-display text-base font-bold uppercase text-charcoal">{product.name}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-xs font-bold text-stone hover:text-charcoal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Full Name *</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Email Address *</span>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Phone Number</span>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
            </label>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Estimated Budget Range</span>
            <select value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })} className={field}>
              <option value="Under ₹50,000">Under ₹50,000</option>
              <option value="₹50,000 – ₹1,00,000">₹50,000 – ₹1,00,000</option>
              <option value="₹1,00,000 – ₹2,50,000">₹1,00,000 – ₹2,50,000</option>
              <option value="₹2,50,000+">₹2,50,000+</option>
            </select>
          </label>

          {/* Saved Measurement Profile Checkbox */}
          {savedProfile && (
            <label className="flex items-center gap-2 p-3 bg-mist/60 border border-gold/40 rounded-xl cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={useSavedProfile}
                onChange={(e) => handleToggleSavedProfile(e.target.checked)}
                className="accent-charcoal rounded"
              />
              <span className="text-charcoal font-semibold">
                ✨ Use My Saved Measurement Profile (<strong className="text-gold-dark">{savedProfile.name}</strong>)
              </span>
            </label>
          )}

          {/* Body Measurements */}
          <div className="p-3 bg-mist/30 border border-cloud/60 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">Bespoke Body Measurements (Inches)</span>
            <div className="grid grid-cols-4 gap-2">
              <label className="block">
                <span className="text-[9px] uppercase text-stone block">Bust/Chest</span>
                <input placeholder='34"' value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} className="w-full rounded-lg border border-cloud bg-white p-2 text-xs font-mono font-bold" />
              </label>
              <label className="block">
                <span className="text-[9px] uppercase text-stone block">Waist</span>
                <input placeholder='28"' value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} className="w-full rounded-lg border border-cloud bg-white p-2 text-xs font-mono font-bold" />
              </label>
              <label className="block">
                <span className="text-[9px] uppercase text-stone block">Hip</span>
                <input placeholder='38"' value={form.hip} onChange={(e) => setForm({ ...form, hip: e.target.value })} className="w-full rounded-lg border border-cloud bg-white p-2 text-xs font-mono font-bold" />
              </label>
              <label className="block">
                <span className="text-[9px] uppercase text-stone block">Height</span>
                <input placeholder="5'5''" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="w-full rounded-lg border border-cloud bg-white p-2 text-xs font-mono font-bold" />
              </label>
            </div>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Customization Requests / Sizing Notes</span>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={field} />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-black"
          >
            {submitting ? "Submitting Inquiry..." : "Submit Bespoke Inquiry →"}
          </button>
        </form>
      </div>
    </div>
  );
}
