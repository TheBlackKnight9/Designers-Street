"use client";

import Link from "next/link";
import { Search, Mail, Bell, Plus, ExternalLink } from "lucide-react";
import { AdminHouseSwitcher } from "./AdminHouseSwitcher";

interface AdminTopBarProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
}

export function AdminTopBar({ title, subtitle, actionButton }: AdminTopBarProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#ECE8DC]">
      {/* Title & Subtitle */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="font-sans text-xs text-[#8A8A8A] mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Utilities & User Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Active House Switcher */}
        <div className="hidden sm:block">
          <AdminHouseSwitcher />
        </div>

        {/* Custom Action or Default "+ New Designer House" Button */}
        {actionButton ? (
          actionButton.href ? (
            <Link
              href={actionButton.href}
              className="inline-flex items-center gap-2 bg-[#F6D746] text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-none hover:bg-[#F6D746]/90 transition-all shadow-2xs active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              {actionButton.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={actionButton.onClick}
              className="inline-flex items-center gap-2 bg-[#F6D746] text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-none hover:bg-[#F6D746]/90 transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              {actionButton.label}
            </button>
          )
        ) : (
          <Link
            href="/admin/designers"
            className="inline-flex items-center gap-2 bg-[#F6D746] text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-none hover:bg-[#F6D746]/90 transition-all shadow-2xs active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
            New House
          </Link>
        )}

        {/* Icon Action Buttons */}
        <button
          type="button"
          className="w-9 h-9 rounded-none bg-white border border-[#ECE8DC] flex items-center justify-center text-[#1A1A1A] hover:bg-[#F4F0E5] transition-colors shadow-2xs cursor-pointer"
          aria-label="Messages"
        >
          <Mail className="w-4 h-4 stroke-[1.8]" />
        </button>

        <button
          type="button"
          className="w-9 h-9 rounded-none bg-white border border-[#ECE8DC] flex items-center justify-center text-[#1A1A1A] hover:bg-[#F4F0E5] transition-colors shadow-2xs cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Studio Link */}
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-none bg-[#17181D] text-white flex items-center justify-center hover:bg-black transition-colors shadow-2xs"
          title="Open Designer Studio"
        >
          <ExternalLink className="w-4 h-4 stroke-[1.8]" />
        </Link>

        {/* Admin Avatar Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#ECE8DC]">
          <div className="w-9 h-9 rounded-none bg-[#F6D746] text-[#1A1A1A] font-bold text-xs flex items-center justify-center border border-[#ECE8DC] shadow-2xs">
            AD
          </div>
          <div className="hidden xl:block text-left">
            <span className="font-sans text-xs font-bold text-[#1A1A1A] block leading-tight">
              Super Admin
            </span>
            <span className="font-sans text-[10px] text-[#8A8A8A] block leading-tight">
              admin@designersstreet.in
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
