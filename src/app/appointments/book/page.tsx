"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { useAppointmentSlots, useAppointments } from "@/hooks/useAtelier";
import { SlotPicker } from "@/components/atelier/SlotPicker";
import { useStorefrontDesigners } from "@/hooks/useStorefrontCatalog";
import { DESIGNERS } from "@/lib/mock-data";
import type { AppointmentSlotData } from "@/lib/types";

export default function BookAppointmentPage() {
  const catalogDesigners = useStorefrontDesigners();
  const designers = catalogDesigners.enabled ? catalogDesigners.designers : DESIGNERS;

  const [selectedDesignerId, setSelectedDesignerId] = useState(designers[0]?.id || "dh-1");
  const [selectedDate, setSelectedDate] = useState("2026-08-05");
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlotData | null>(null);

  const [purpose, setPurpose] = useState("Bridal Lehenga Consultation");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { slots } = useAppointmentSlots(selectedDesignerId, selectedDate);
  const { book } = useAppointments();

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    await book({
      designerId: selectedDesignerId,
      slotId: selectedSlot?.id,
      preferredDate: selectedDate,
      preferredTime: selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : "11:00 AM",
      appointmentType: selectedSlot?.type || "virtual",
      purpose,
      message,
    });
    setSubmitted(true);
  };

  return (
    <>
      <TopBar />

      <main className="min-h-screen bg-[#FDFCF8] pb-20">
        <div className="p-6 bg-[#101010] text-white">
          <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] block mb-1">
            Private Consultation Booking
          </span>
          <h1 className="font-display text-2xl font-extrabold uppercase">
            Book Designer Consultation
          </h1>
          <p className="font-sans text-xs text-white/80 mt-1">
            Schedule a virtual video call, atelier studio visit, or phone consultation with master designers.
          </p>
        </div>

        <div className="p-4 sm:p-8 max-w-2xl mx-auto">
          {submitted ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#E8E4DC] shadow-sm space-y-4">
              <span className="text-4xl block">✨</span>
              <h2 className="font-display text-xl font-bold uppercase text-[#2B2B2B]">
                Consultation Requested!
              </h2>
              <p className="font-sans text-xs text-[#7A7A7A]">
                Your consultation request has been dispatched to the designer house concierge.
              </p>
              <Link
                href="/account/atelier"
                className="inline-block px-6 py-2.5 bg-[#101010] text-white font-sans text-xs font-extrabold uppercase rounded-full"
              >
                View My Appointments →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleBook} className="bg-white rounded-xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
              {/* Designer Selector */}
              <div>
                <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                  1. Select Designer House
                </label>
                <select
                  value={selectedDesignerId}
                  onChange={(e) => setSelectedDesignerId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none"
                >
                  {designers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div>
                <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                  2. Select Consultation Date
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none"
                />
              </div>

              {/* Slot Picker */}
              <SlotPicker
                slots={slots}
                selectedSlotId={selectedSlot?.id}
                onSelectSlot={(slot) => setSelectedSlot(slot)}
              />

              {/* Purpose */}
              <div>
                <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                  3. Consultation Purpose
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridal Lehenga fitting & zardozi border customization"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="font-sans text-xs font-extrabold uppercase text-[#2B2B2B] block mb-1">
                  4. Special Notes or Questions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention color preferences, timeline requirements, or fit concerns..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E8E4DC] font-sans text-xs outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#101010] text-white font-sans text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md active:scale-98 transition-all"
              >
                Confirm Appointment Request
              </button>
            </form>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}
