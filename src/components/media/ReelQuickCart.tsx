"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";

export type QuickCartPayload = {
  name: string;
  brand: string;
  price: number;
  size: string;
  image?: string | null;
  quantity: number;
  subtotal: number;
};

type ReelQuickCartProps = {
  open: boolean;
  payload: QuickCartPayload | null;
  onClose: () => void;
  onCheckout: () => void;
};

export function ReelQuickCart({
  open,
  payload,
  onClose,
  onCheckout,
}: ReelQuickCartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open || !payload || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[85] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Added to bag"
        className="relative z-10 mx-auto w-full max-w-lg rounded-t-3xl border-t border-white/20 bg-[#FDFCF8] shadow-2xl"
        style={{ animation: "ds-sheet-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span className="h-1 w-10 rounded-full bg-[#D0D0D0]" />
        </div>
        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
          <p className="font-sans text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7A7A7A]">
            Added to bag
          </p>
          <div className="mt-3 flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#EEE]">
              {payload.image ? (
                <Image
                  src={payload.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-bold text-[#2B2B2B] truncate">
                {payload.name}
              </p>
              <p className="font-sans text-[11px] uppercase tracking-wider text-[#7A7A7A] mt-0.5">
                {payload.brand} · Size {payload.size}
              </p>
              <p className="font-sans text-xs text-[#4A4A4A] mt-1">
                Qty {payload.quantity} · Subtotal{" "}
                <span className="font-bold text-[#2B2B2B]">
                  {formatPrice(payload.subtotal)}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full border border-[#2B2B2B]/20 font-sans text-[11px] font-extrabold uppercase tracking-wider text-[#2B2B2B] active:scale-[0.98] transition-transform"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={onCheckout}
              className="flex-1 h-11 rounded-full bg-[#2B2B2B] text-white font-sans text-[11px] font-extrabold uppercase tracking-wider active:scale-[0.98] transition-transform"
            >
              Checkout
            </button>
          </div>
          <Link
            href="/cart"
            onClick={onClose}
            className="mt-3 block text-center font-sans text-[10px] uppercase tracking-wider text-[#7A7A7A] underline"
          >
            View bag
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
