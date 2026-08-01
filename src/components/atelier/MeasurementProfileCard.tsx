"use client";

import type { MeasurementProfileData } from "@/lib/types";

type MeasurementProfileCardProps = {
  profile: MeasurementProfileData;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  className?: string;
};

export function MeasurementProfileCard({
  profile,
  isSelected,
  onSelect,
  onDelete,
  className = "",
}: MeasurementProfileCardProps) {
  const fields = [
    { label: "Height", value: profile.height },
    { label: "Chest", value: profile.chest },
    { label: "Waist", value: profile.waist },
    { label: "Hip", value: profile.hip },
    { label: "Shoulder", value: profile.shoulder },
    { label: "Sleeve", value: profile.sleeve },
    { label: "Inseam", value: profile.inseam },
    { label: "Neck", value: profile.neck },
  ].filter((f) => f.value !== undefined && f.value !== null);

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border p-4 transition-all cursor-pointer ${
        isSelected
          ? "bg-white border-[#101010] shadow-md ring-1 ring-[#101010]"
          : "bg-[#FDFCF8] border-[#E8E4DC] hover:border-[#2B2B2B]"
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-bold uppercase text-[#2B2B2B]">
            {profile.name}
          </h3>
          {profile.isDefault && (
            <span className="px-2 py-0.5 bg-[#C5A059] text-black font-sans text-[8px] font-extrabold uppercase rounded-full">
              Default
            </span>
          )}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-xs text-red-600 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {fields.length > 0 ? (
        <div className="grid grid-cols-4 gap-2 py-2 border-y border-[#F0ECE4] text-[10px] font-sans">
          {fields.map((f) => (
            <div key={f.label}>
              <span className="text-[#7A7A7A] uppercase block text-[8px]">{f.label}</span>
              <span className="font-bold text-[#2B2B2B]">
                {f.value} {profile.unit}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-sans text-xs text-[#7A7A7A] italic">No measurements recorded.</p>
      )}

      {profile.notes && (
        <p className="font-sans text-[10px] text-[#7A7A7A] mt-2 italic line-clamp-1">
          📌 {profile.notes}
        </p>
      )}
    </div>
  );
}
