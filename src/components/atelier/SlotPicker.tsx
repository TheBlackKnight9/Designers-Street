"use client";

import type { AppointmentSlotData } from "@/lib/types";

type SlotPickerProps = {
  slots: AppointmentSlotData[];
  selectedSlotId?: string;
  onSelectSlot: (slot: AppointmentSlotData) => void;
  className?: string;
};

export function SlotPicker({
  slots,
  selectedSlotId,
  onSelectSlot,
  className = "",
}: SlotPickerProps) {
  if (!slots.length) {
    return (
      <div className={`p-4 rounded-xl bg-[#F9F7F2] border border-[#E8E4DC] text-center ${className}`}>
        <p className="font-sans text-xs text-[#7A7A7A]">
          No open consultation slots published for this date.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] block">
        Available Atelier Slots
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-[#101010] text-white border-[#101010] shadow-sm"
                  : "bg-white text-[#2B2B2B] border-[#E8E4DC] hover:border-[#2B2B2B]"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-sans text-[9px] font-extrabold uppercase tracking-wider text-[#C5A059]">
                  {slot.type.replace("_", " ")}
                </span>
                {isSelected && <span className="text-xs">✓</span>}
              </div>
              <p className="font-display text-xs font-bold">
                {slot.startTime} - {slot.endTime}
              </p>
              <p className="font-sans text-[10px] opacity-80 mt-0.5">
                {slot.date}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
