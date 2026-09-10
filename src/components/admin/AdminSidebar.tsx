"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Package,
  Clapperboard,
  CreditCard,
  FileText,
  Tag,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Designer Houses", href: "/admin/designers", icon: Store },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Content Studio", href: "/dashboard/posts", icon: Clapperboard },
  { label: "Payouts", href: "/admin/payouts", icon: CreditCard },
  { label: "Applications", href: "/admin/applications", icon: FileText },
];

const SECONDARY_NAV: NavItem[] = [
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Disputes", href: "/admin/disputes", icon: AlertCircle },
  { label: "Reviews", href: "/admin/product-reviews", icon: MessageSquare },
  { label: "Concept Leads", href: "/admin/concept-leads", icon: Sparkles },
];

const BOTTOM_NAV: NavItem[] = [
  { label: "Notification", href: "/notifications", icon: Bell },
  { label: "Help", href: "/seller-terms", icon: HelpCircle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Log out", href: "/login", icon: LogOut },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderNavGroup = (items: NavItem[]) => (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-all ${
                isActive
                  ? "bg-zinc-900 text-zinc-100 shadow-xs border border-zinc-800/90"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />
              <span className="truncate tracking-tight">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                  {item.badge}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-5 right-5 z-[90] p-3 rounded-full bg-zinc-950 text-white shadow-xl border border-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-900"
        aria-label="Toggle Navigation Sidebar"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[80] bg-black/70 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel - No scrollbar visible */}
      <aside
        className={`w-64 h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain bg-zinc-950 text-zinc-300 border-r border-zinc-800/80 flex flex-col justify-between p-4 flex-shrink-0 transition-all duration-300 z-[85] ${
          mobileOpen
            ? "fixed inset-y-0 left-0 shadow-2xl"
            : "hidden lg:flex"
        }`}
      >
        <div className="space-y-4">
          {/* Brand Logo & Name */}
          <Link href="/admin" className="flex items-center gap-2.5 px-2 py-1 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-white transition-colors">
              DS
            </div>
            <div className="leading-none">
              <span className="text-sm font-semibold tracking-tight text-zinc-100 block">
                Designer's Street
              </span>
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block mt-1">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Primary Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Overview
            </p>
            {renderNavGroup(PRIMARY_NAV)}
          </div>

          <div className="h-[1px] bg-zinc-900 my-2" />

          {/* Secondary Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Management
            </p>
            {renderNavGroup(SECONDARY_NAV)}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="pt-3 border-t border-zinc-900 space-y-1">
          {renderNavGroup(BOTTOM_NAV)}
        </div>
      </aside>
    </>
  );
}
