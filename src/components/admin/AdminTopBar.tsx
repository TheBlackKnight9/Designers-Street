"use client";

import Link from "next/link";
import { Search, Mail, Bell, Plus, ExternalLink } from "lucide-react";
import { AdminHouseSwitcher } from "./AdminHouseSwitcher";

interface AdminTopBarProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    href?: string;
    onClick?: () => void | Promise<void>;
    icon?: React.ElementType;
  };
  children?: React.ReactNode;
}

export function AdminTopBar({ title, subtitle, actionButton, children }: AdminTopBarProps) {
  const ActionIcon = actionButton?.icon || Plus;

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 mb-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-950">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-zinc-500 mt-1 font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {/* Utilities & User Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        {children}

        {/* Active House Switcher */}
        <div className="hidden sm:block">
          <AdminHouseSwitcher />
        </div>

        {/* Custom Action or Default "+ New Designer House" Button */}
        {actionButton ? (
          actionButton.href ? (
            <Link
              href={actionButton.href}
              className="inline-flex items-center gap-2 bg-zinc-950 text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-zinc-800 transition-colors shadow-xs active:scale-[0.98]"
            >
              <ActionIcon className="w-3.5 h-3.5" />
              {actionButton.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={actionButton.onClick}
              className="inline-flex items-center gap-2 bg-zinc-950 text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-zinc-800 transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <ActionIcon className="w-3.5 h-3.5" />
              {actionButton.label}
            </button>
          )
        ) : (
          <Link
            href="/admin/designers"
            className="inline-flex items-center gap-2 bg-zinc-950 text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-zinc-800 transition-colors shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            New House
          </Link>
        )}

        {/* Studio Link */}
        <Link
          href="/dashboard"
          className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 border border-zinc-200 flex items-center justify-center transition-colors shadow-2xs"
          title="Open Designer Studio"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Admin Avatar Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white font-semibold text-xs flex items-center justify-center shadow-2xs">
            AD
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-medium text-zinc-900 block leading-tight">
              Super Admin
            </span>
            <span className="text-[10px] text-zinc-500 block leading-tight">
              admin@designersstreet.in
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
