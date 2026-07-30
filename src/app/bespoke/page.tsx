"use client";

import { useState } from "react";
import Image from "next/image";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

const STEPS = ["Design", "Fabric", "Details", "Consultation"];

const FABRICS = [
  { name: "Raw Silk", desc: "Rich texture, structured drape" },
  { name: "Pashmina", desc: "Cloud-soft, hand-spun cashmere" },
  { name: "Organza", desc: "Sheer, ethereal layering" },
  { name: "Kanchipuram Silk", desc: "Temple-woven, heirloom weight" },
  { name: "Italian Crepe", desc: "Fluid, matte finish" },
  { name: "Handloom Cotton", desc: "Breathable, block-print ready" },
];

const EMBELLISHMENTS = [
  "Zardozi Embroidery",
  "Sozni Needlework",
  "Chikankari",
  "Mirror Work",
  "Sequin & Bead",
  "None — Clean Finish",
];

export default function BespokePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState({
    category: "",
    fabric: "",
    color: "",
    embellishment: "",
    notes: "",
  });

  const canProceed = () => {
    switch (currentStep) {
      case 0: return config.category !== "";
      case 1: return config.fabric !== "";
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };
  const back = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  return (
    <>
      <TopBar />
      <main className="min-h-screen">
        {/* Hero */}
        <div className="relative w-full aspect-[16/9] bg-[#F0F0F0]">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
            alt="Bespoke atelier"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="font-display text-2xl font-bold text-white uppercase tracking-wide">
              Bespoke
            </h1>
            <p className="font-sans text-xs text-white/80 mt-1">
              Your vision, their hands. Made to your measure.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-4 py-4 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-1">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-1 flex-1">
                <div className={`w-full h-1 rounded-full ${i <= currentStep ? "bg-[#2B2B2B]" : "bg-[#E0E0E0]"}`} />
              </div>
            ))}
          </div>
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mt-3">
            Step {currentStep + 1}: {STEPS[currentStep]}
          </p>
        </div>

        {/* Step Content */}
        <div className="px-4 py-6">
          {/* Step 0: Choose Base Design */}
          {currentStep === 0 && (
            <div>
              <h2 className="font-sans text-sm font-semibold text-[#2B2B2B] mb-4">
                What would you like us to create?
              </h2>
              <div className="space-y-2">
                {["Lehenga", "Saree", "Sherwani / Bandhgala", "Gown", "Kurta Set", "Coat / Cape", "Other"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setConfig({ ...config, category: cat })}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                      config.category === cat
                        ? "border-[#2B2B2B] bg-[#2B2B2B] text-[#FAFAFA]"
                        : "border-[#E0E0E0] text-[#2B2B2B]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Fabric */}
          {currentStep === 1 && (
            <div>
              <h2 className="font-sans text-sm font-semibold text-[#2B2B2B] mb-4">
                Choose your fabric
              </h2>
              <div className="space-y-2">
                {FABRICS.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => setConfig({ ...config, fabric: f.name })}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                      config.fabric === f.name
                        ? "border-[#2B2B2B] bg-[#2B2B2B] text-[#FAFAFA]"
                        : "border-[#E0E0E0] text-[#2B2B2B]"
                    }`}
                  >
                    <span className="text-sm font-medium block">{f.name}</span>
                    <span className={`text-xs mt-0.5 block ${
                      config.fabric === f.name ? "text-[#E0E0E0]" : "text-[#7A7A7A]"
                    }`}>
                      {f.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div>
              <h2 className="font-sans text-sm font-semibold text-[#2B2B2B] mb-4">
                Embellishment & notes
              </h2>
              <div className="space-y-2 mb-6">
                {EMBELLISHMENTS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setConfig({ ...config, embellishment: e })}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                      config.embellishment === e
                        ? "border-[#2B2B2B] bg-[#2B2B2B] text-[#FAFAFA]"
                        : "border-[#E0E0E0] text-[#2B2B2B]"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-2 block">
                  Additional Notes (optional)
                </span>
                <textarea
                  value={config.notes}
                  onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 font-sans text-sm text-[#2B2B2B] placeholder:text-[#A0A0A0] outline-none focus:border-[#2B2B2B] transition-colors resize-none"
                  placeholder="Color preferences, reference images, occasion details…"
                />
              </label>
            </div>
          )}

          {/* Step 3: Consultation */}
          {currentStep === 3 && (
            <div>
              <h2 className="font-sans text-sm font-semibold text-[#2B2B2B] mb-2">
                Book a Design Consultation
              </h2>
              <p className="font-sans text-xs text-[#7A7A7A] mb-6 leading-relaxed">
                A stylist from our atelier will contact you to discuss your vision, confirm fabric and sizing, and provide a quote and timeline. Bespoke pieces typically take 8–16 weeks.
              </p>

              {/* Summary */}
              <div className="bg-[#F0F0F0] rounded-xl p-4 mb-6 space-y-2">
                <p className="font-sans text-xs text-[#7A7A7A]">
                  <strong className="text-[#2B2B2B]">Design:</strong> {config.category || "—"}
                </p>
                <p className="font-sans text-xs text-[#7A7A7A]">
                  <strong className="text-[#2B2B2B]">Fabric:</strong> {config.fabric || "—"}
                </p>
                <p className="font-sans text-xs text-[#7A7A7A]">
                  <strong className="text-[#2B2B2B]">Embellishment:</strong> {config.embellishment || "—"}
                </p>
                {config.notes && (
                  <p className="font-sans text-xs text-[#7A7A7A]">
                    <strong className="text-[#2B2B2B]">Notes:</strong> {config.notes}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="w-full h-12 bg-[#2B2B2B] text-[#FAFAFA] font-sans text-xs font-semibold uppercase tracking-wider rounded-full btn-press"
              >
                Request Consultation
              </button>
              <p className="text-center font-sans text-xs text-[#A0A0A0] mt-3">
                No obligation. A stylist will reach out within 24 hours.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <div className="px-4 pb-6 flex gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={back}
                className="flex-1 h-12 border border-[#E0E0E0] text-[#2B2B2B] font-sans text-xs font-semibold uppercase tracking-wider rounded-full btn-press"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={!canProceed()}
              className={`flex-1 h-12 font-sans text-xs font-semibold uppercase tracking-wider rounded-full btn-press ${
                canProceed()
                  ? "bg-[#2B2B2B] text-[#FAFAFA]"
                  : "bg-[#E0E0E0] text-[#A0A0A0] cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
