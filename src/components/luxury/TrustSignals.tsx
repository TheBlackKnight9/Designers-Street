"use client";

import { TRUST_SIGNALS } from "@/lib/luxury";

type TrustSignalsProps = {
  deliveryText?: string | null;
  verifiedDesigner?: boolean;
  className?: string;
};

export function TrustSignals({
  deliveryText,
  verifiedDesigner = true,
  className = "",
}: TrustSignalsProps) {
  const items = TRUST_SIGNALS.filter(
    (s) => verifiedDesigner || s.id !== "verified"
  );

  return (
    <section
      className={`border-y border-[#EBEBEB] py-4 ${className}`}
      aria-label="Shopping confidence"
    >
      {deliveryText ? (
        <p className="font-sans text-xs text-[#4A4A4A] mb-3">
          <span className="font-semibold text-[#2B2B2B]">Estimated delivery: </span>
          {deliveryText}
        </p>
      ) : null}
      <ul className="grid grid-cols-2 gap-2">
        {items.map((s) => (
          <li
            key={s.id}
            className="flex items-start gap-2 font-sans text-[10px] text-[#5C5346]"
          >
            <span
              className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-[#2B2B2B] flex-shrink-0"
              aria-hidden
            />
            {s.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
