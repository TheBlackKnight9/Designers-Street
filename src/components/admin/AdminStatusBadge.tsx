"use client";

import React from "react";

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

export function AdminStatusBadge({ status, className = "" }: AdminStatusBadgeProps) {
  const s = (status || "").toLowerCase().trim();

  let style = "bg-zinc-100 text-zinc-700 border-zinc-200";
  let dot = "bg-zinc-400";

  if (["paid", "verified", "approved", "active", "published", "completed", "success"].some((k) => s.includes(k))) {
    style = "bg-zinc-900 text-zinc-50 border-zinc-900";
    dot = "bg-emerald-400";
  } else if (["delivered", "delivered_confirmed"].some((k) => s.includes(k))) {
    style = "bg-zinc-100 text-zinc-900 border-zinc-300";
    dot = "bg-zinc-900";
  } else if (["shipped", "in_transit"].some((k) => s.includes(k))) {
    style = "bg-zinc-100 text-zinc-800 border-zinc-200";
    dot = "bg-blue-500";
  } else if (["processing", "in-progress"].some((k) => s.includes(k))) {
    style = "bg-zinc-100 text-zinc-800 border-zinc-200";
    dot = "bg-amber-500";
  } else if (["suspended", "declined", "rejected", "cancelled", "dispute", "failed"].some((k) => s.includes(k))) {
    style = "bg-red-50 text-red-700 border-red-200/80";
    dot = "bg-red-500";
  } else if (["pending", "draft", "in_review"].some((k) => s.includes(k))) {
    style = "bg-zinc-50 text-zinc-600 border-zinc-200";
    dot = "bg-zinc-400";
  }

  const label = status
    ? status
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Draft";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-md border tracking-tight whitespace-nowrap ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
