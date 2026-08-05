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
      className="bg-white rounded-2xl p-5 border border-[#ECE8DC] shadow-2xs hover:border-[#17181D] hover:shadow-md transition-all group flex flex-col justify-between"
    >
      <div>
        <div className="w-10 h-10 rounded-xl bg-[#F4F0E5] flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <h4 className="font-sans text-sm font-bold text-[#1A1A1A] group-hover:underline leading-snug">
          {label}
        </h4>
        <p className="font-sans text-xs text-[#8A8A8A] mt-1 line-clamp-2 leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#ECE8DC] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
        <span>Manage</span>
        <ArrowRight className="w-4 h-4 stroke-[2] group-hover:translate-x-1 transition-transform text-[#1A1A1A]" />
      </div>
    </Link>
  );
}
