"use client";

import { useState } from "react";
import { createAppointment } from "@/lib/api/luxury";

/**
 * Deferred post-v0.8.1 workflow. This component has no public navigation or
 * page integration and must remain unmounted until its product phase is approved.
 */
type AppointmentRequestFormProps = {
  designerId: string;
  designerName: string;
  onSuccess?: () => void;
};

export function AppointmentRequestForm({
  designerId,
  designerName,
  onSuccess,
}: AppointmentRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("11:00");
  const [purpose, setPurpose] = useState("Private consultation");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(null);
    if (!preferredDate || !preferredTime || !purpose.trim()) {
      setError("Date, time, and purpose are required");
      return;
    }
    setSubmitting(true);
    try {
      await createAppointment({
        designerId,
        preferredDate,
        preferredTime,
        purpose: purpose.trim(),
        message: message.trim() || undefined,
      });
      setDone(true);
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-11 border border-[#2B2B2B] text-[#2B2B2B] font-sans text-xs font-semibold uppercase tracking-wider rounded-full btn-press"
      >
        Request private appointment
      </button>
    );
  }

  if (done) {
    return (
      <div className="rounded-xl border border-[#E8E4DC] bg-[#FDFCF8] p-4 text-center">
        <p className="font-sans text-sm font-semibold text-[#2B2B2B]">
          Request sent
        </p>
        <p className="font-sans text-xs text-[#7A7A7A] mt-1">
          {designerName} will review your consultation request.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#EBEBEB] bg-white p-4 space-y-3">
      <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B]">
        Private appointment
      </p>
      <label className="block">
        <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
          Preferred date
        </span>
        <input
          type="date"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          className="mt-1 w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 font-sans text-sm outline-none focus:border-[#2B2B2B]"
        />
      </label>
      <label className="block">
        <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
          Preferred time
        </span>
        <input
          type="time"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
          className="mt-1 w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 font-sans text-sm outline-none focus:border-[#2B2B2B]"
        />
      </label>
      <label className="block">
        <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
          Purpose
        </span>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="mt-1 w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 font-sans text-sm outline-none focus:border-[#2B2B2B] bg-white"
        >
          <option>Private consultation</option>
          <option>Bridal fitting</option>
          <option>Bespoke brief</option>
          <option>Collection preview</option>
        </select>
      </label>
      <label className="block">
        <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
          Message
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Occasion, preferred silhouettes, timeline…"
          className="mt-1 w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 font-sans text-sm outline-none focus:border-[#2B2B2B] resize-none"
        />
      </label>
      {error ? (
        <p className="font-sans text-xs text-[#8B3A3A]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 h-11 border border-[#E0E0E0] font-sans text-xs font-semibold uppercase tracking-wider rounded-full"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting}
          className="flex-1 h-11 bg-[#2B2B2B] text-[#FAFAFA] font-sans text-xs font-semibold uppercase tracking-wider rounded-full disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
