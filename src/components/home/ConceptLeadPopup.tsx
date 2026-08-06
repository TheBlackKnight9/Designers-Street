"use client";

import { useState } from "react";
import { useToast } from "@/components/dashboard/Toast";

interface ConceptLeadPopupProps {
  postId: string;
  designerName: string;
  captionSnippet: string;
  onClose: () => void;
}

export function ConceptLeadPopup({ postId, designerName, captionSnippet, onClose }: ConceptLeadPopupProps) {
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      push("Name and Phone are required", "err");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/concept-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "POST",
          postId,
          name: form.name,
          phone: form.phone,
          notes: form.notes,
        }),
      });

      if (res.ok) {
        push("Your interest has been recorded! The designer will contact you soon.", "ok");
        onClose();
      } else {
        const errorData = await res.json();
        push(errorData?.error?.message || "Failed to submit lead", "err");
      }
    } catch {
      push("Network error. Please try again.", "err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#FDFCF8] rounded-3xl shadow-2xl overflow-hidden relative border border-white/50 animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone hover:text-charcoal transition-colors rounded-full hover:bg-black/5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-4">
              <span>✨ Concept Design</span>
            </div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal mb-2">
              Request this Design
            </h2>
            <p className="text-sm text-stone">
              Express your interest in this concept by <span className="font-semibold text-charcoal">{designerName}</span>. 
              The atelier will contact you to discuss possibilities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white border border-cloud rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-white border border-cloud rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="+91"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Message (Optional)
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full bg-white border border-cloud rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="E.g., Can you make this in black?"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#2B2B2B] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Interest"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
