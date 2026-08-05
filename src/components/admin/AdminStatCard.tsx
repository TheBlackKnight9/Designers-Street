"use client";

import Link from "next/link";
import React from "react";

interface AdminStatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  href?: string;
  badgeBg?: string;
}

export function AdminStatCard({
  label,
  value,
  sub,
  icon,
  href,
  badgeBg = "bg-[#F4F0E5] text-[#1A1A1A]",
}: AdminStatCardProps) {
  const content = (
    <div className="bg-white rounded-2xl p-5 border border-[#ECE8DC] shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between h-full group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${badgeBg}`}>
          {icon}
        </div>
        {sub && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F4F0E5] text-[#8A8A8A]">
            {sub}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-display text-2xl md:text-3xl font-bold text-[#1A1A1A] leading-tight group-hover:text-[#17181D]">
          {value}
        </h3>
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#8A8A8A] mt-1">
          {label}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
