"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { useBespokeRequests, useMeasurementProfiles } from "@/hooks/useAtelier";
import { useStorefrontDesigners } from "@/hooks/useStorefrontCatalog";
import { MeasurementProfileCard } from "@/components/atelier/MeasurementProfileCard";
import { DESIGNERS } from "@/lib/mock-data";

export default function CreateBespokeRequestPage() {
  const catalogDesigners = useStorefrontDesigners();
  const designers = catalogDesigners.enabled ? catalogDesigners.designers : DESIGNERS;
  const { profiles } = useMeasurementProfiles();
  const { createRequest } = useBespokeRequests();

  const [designerId, setDesignerId] = useState(designers[0]?.id || "dh-1");
  const [category, setCategory] = useState("Royal Heritage Lehenga");
  const [occasion, setOccasion] = useState("Wedding Reception Gala");
  const [budget, setBudget] = useState(300000);
  const [deadline, setDeadline] = useState("2026-10-15");
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || "");
  const [notes, setNotes] = useState("Looking for midnight navy velvet with 24k antique gold bullion zardozi embroidery.");
  const [referenceUrl, setReferenceUrl] = useState("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80");

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRequest({
      designerId,
      category,
      occasion,
      budget: Number(budget),
      deadline,
      measurementProfileId: selectedProfileId,
      notes,
      referenceImages: referenceUrl ? [referenceUrl] : [],
    });
    setSubmitted(true);
  };

  return (
    <>
      <TopBar />

      <main className="min-h-screen bg-[#FDFCF8] pb-20">
        <div className="p-6 bg-[#101010] text-white">
          <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] block mb-1">
            Custom Garment Atelier Service
          </span>
          <h1 className="font-display text-2xl font-extrabold uppercase">
            Submit Bespoke Request
          </h1>
          <p className="font-sans text-xs text-white/80 mt-1">
            Commission one-of-a-kind couture garments with custom fabric, zari weight, and precision measurements directly with designer ateliers.
          </p>
        </div>

        <div className="p-4 sm:p-8 max-w-2xl mx-auto">
          {submitted ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#E8E4DC] shadow-sm space-y-4">
              <span className="text-4xl block">✨</span>
              <h2 className="font-display text-xl font-bold uppercase text-[#2B2B2B]">
                Bespoke Request Submitted!
              </h2>
              <p className="font-sans text-xs text-[#7A7A7A]">
                Your custom garment specification has been transmitted to the atelier master weaver.
              </p>
              <Link
                href="/account/atelier"
                className="inline-block px-6 py-2.5 bg-[#101010] text-white font-sans text-xs font-extrabold uppercase rounded-full"
              >
                Track Request Progress →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
              {/* Designer House */}
              <div>
                <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                  1. Target Designer Atelier
                </label>
                <select
                  value={designerId}
                  onChange={(e) => setDesignerId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none"
                >
                  {designers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category & Occasion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                    2. Garment Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Heritage Lehenga"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                    3. Target Occasion
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wedding Reception Gala"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none"
                  />
                </div>
              </div>

              {/* Budget & Target Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                    4. Budget Target (₹)
                  </label>
                  <input
                    type="number"
                    required
                    step={10000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                    5. Required Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none"
                  />
                </div>
              </div>

              {/* Measurement Profile Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B]">
                    6. Attach Measurement Fit Profile
                  </label>
                  <Link
                    href="/account/atelier"
                    className="font-sans text-[10px] font-bold uppercase text-[#C5A059] underline"
                  >
                    Manage Profiles
                  </Link>
                </div>
                {profiles.length > 0 ? (
                  <div className="space-y-2">
                    {profiles.map((prof) => (
                      <MeasurementProfileCard
                        key={prof.id}
                        profile={prof}
                        isSelected={selectedProfileId === prof.id}
                        onSelect={() => setSelectedProfileId(prof.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="font-sans text-xs text-[#7A7A7A] italic">
                    No fit profiles found. Using default measurements.
                  </p>
                )}
              </div>

              {/* Inspiration Image Attachment */}
              <div>
                <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                  7. Inspiration / Sketch Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none"
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                  8. Special Atelier Instructions & Embroidery Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe motif placements, lining silk preference, padded cups, dupattas, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#101010] text-white font-sans text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md active:scale-98 transition-all"
              >
                Transmit Bespoke Specification
              </button>
            </form>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}
