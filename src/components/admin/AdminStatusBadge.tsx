"use client";

import React from "react";

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

export function AdminStatusBadge({ status, className = "" }: AdminStatusBadgeProps) {
  const s = (status || "").toLowerCase().trim();

  let bg = "bg-[#E4E1D6] text-[#2B2B2B]";

  if (["paid", "verified", "approved", "active", "published"].some((k) => s.includes(k))) {
    bg = "bg-[#F6D746] text-[#1A1A1A]";
  } else if (["delivered", "shipped", "in-progress", "processing", "in_transit"].some((k) => s.includes(k))) {
    bg = "bg-[#F3B383] text-[#1A1A1A]";
  } else if (["completed", "resolved", "delivered_confirmed", "success"].some((k) => s.includes(k))) {
    bg = "bg-[#A9E4B0] text-[#1A1A1A]";
  } else if (["suspended", "declined", "rejected", "cancelled", "dispute", "failed"].some((k) => s.includes(k))) {
    bg = "bg-[#F2A6A6] text-[#1A1A1A]";
  } else if (["pending", "draft", "in_review"].some((k) => s.includes(k))) {
    bg = "bg-[#E4E1D6] text-[#4A4A4A]";
  }

  const label = status
    ? status
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Draft";

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-none shadow-2xs whitespace-nowrap ${bg} ${className}`}
    >
      {label}
    </span>
  );
}
