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
  loading?: boolean;
}

export function AdminStatCard({
  label,
  value,
  sub,
  icon,
  href,
  loading,
}: AdminStatCardProps) {
  const content = (
    <div className="bg-white rounded-xl p-5 border border-zinc-200/90 shadow-2xs hover:border-zinc-300 hover:shadow-xs transition-all flex flex-col justify-between h-full group">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-zinc-500 tracking-tight">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="h-7 w-14 bg-zinc-200/80 rounded animate-pulse my-0.5" />
        ) : (
          <h3 className="text-2xl font-bold tracking-tight text-zinc-950">
            {value}
          </h3>
        )}
        {sub && (
          <p className="text-[11px] text-zinc-500 font-normal mt-1">
            {sub}
          </p>
        )}
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
