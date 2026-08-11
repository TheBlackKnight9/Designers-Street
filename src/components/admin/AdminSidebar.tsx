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
    <ul className="space-y-1">
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
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-none font-sans text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-[#17181D] font-bold shadow-md"
                  : "text-[#A0A5B5] hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#17181D]" : "text-[#A0A5B5]"}`} />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-none bg-[#F6D746] text-[#1A1A1A]">
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
        className="lg:hidden fixed bottom-4 right-4 z-[90] p-3 rounded-none bg-[#17181D] text-white shadow-xl flex items-center justify-center"
        aria-label="Toggle Navigation Sidebar"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`w-64 h-screen sticky top-0 overflow-y-auto bg-[#17181D] text-white flex flex-col justify-between p-6 flex-shrink-0 transition-all duration-300 ${
          mobileOpen
            ? "fixed inset-y-0 left-0 z-[85] shadow-2xl"
            : "hidden lg:flex"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo & Name */}
          <Link href="/admin" className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-none bg-[#F6D746] text-[#17181D] flex items-center justify-center font-black text-sm shadow-sm">
              DS
            </div>
            <div>
              <span className="font-display text-base font-bold tracking-tight text-white block leading-none">
                Designer's Street
              </span>
              <span className="text-[10px] font-semibold text-[#A0A5B5] uppercase tracking-widest block mt-1">
                Admin Center
              </span>
            </div>
          </Link>

          {/* Primary Navigation */}
          <div>{renderNavGroup(PRIMARY_NAV)}</div>

          <div className="h-[1px] bg-white/10 my-2" />

          {/* Secondary Navigation */}
          <div>
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-2">
              Management
            </p>
            {renderNavGroup(SECONDARY_NAV)}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="pt-6 border-t border-white/10 space-y-1">
          {renderNavGroup(BOTTOM_NAV)}
        </div>
      </aside>
    </>
  );
}
