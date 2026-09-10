"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React from "react";

interface AdminActionHubCardProps {
  label: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
}

export function AdminActionHubCard({ label, desc, icon, href }: AdminActionHubCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl p-5 border border-zinc-200/90 shadow-2xs hover:border-zinc-300 hover:shadow-xs transition-all group flex flex-col justify-between"
    >
      <div>
        <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center mb-3 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
          {icon}
        </div>
        <h4 className="text-sm font-semibold text-zinc-950 tracking-tight">
          {label}
        </h4>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-900">
        <span>Manage module</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-zinc-500 group-hover:text-zinc-950" />
      </div>
    </Link>
  );
}
