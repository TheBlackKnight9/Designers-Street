"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminActionHubCard } from "@/components/admin/AdminActionHubCard";
import {
  Store,
  ShoppingBag,
  Package,
  Clapperboard,
  CreditCard,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type Stat = {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  href: string;
  badgeBg: string;
};

const QUICK_ACTIONS = [
  { label: "Designer Houses", icon: <Store className="w-5 h-5 stroke-[1.8] text-[#1A1A1A]" />, href: "/admin/designers", desc: "Create & manage all registered designer houses" },
  { label: "Products Catalog", icon: <ShoppingBag className="w-5 h-5 stroke-[1.8] text-[#1A1A1A]" />, href: "/admin/products", desc: "Global product verification, prices & stock" },
  { label: "Orders & Shipping", icon: <Package className="w-5 h-5 stroke-[1.8] text-[#1A1A1A]" />, href: "/admin/orders", desc: "Track platform orders, dispatch & delivery" },
  { label: "Content Studio", icon: <Clapperboard className="w-5 h-5 stroke-[1.8] text-[#1A1A1A]" />, href: "/dashboard/posts", desc: "Reels, stories, lookbooks & social posts" },
  { label: "Payouts & Earnings", icon: <CreditCard className="w-5 h-5 stroke-[1.8] text-[#1A1A1A]" />, href: "/admin/payouts", desc: "Manage house revenue splits & payouts" },
  { label: "Applications", icon: <FileText className="w-5 h-5 stroke-[1.8] text-[#1A1A1A]" />, href: "/admin/applications", desc: "Review incoming designer house applications" },
];

function fmt(n: number) {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok && body.data?.stats) {
          const s = body.data.stats;
          setStats([
            {
              label: "Active Houses",
              value: String(s.totalHouses),
              icon: <Store className="w-5 h-5 stroke-[1.8]" />,
              href: "/admin/designers",
              badgeBg: "bg-[#F6D746] text-[#1A1A1A]",
            },
            {
              label: "Published Products",
              value: String(s.totalProducts),
              icon: <ShoppingBag className="w-5 h-5 stroke-[1.8]" />,
              href: "/admin/products",
              badgeBg: "bg-[#F4F0E5] text-[#1A1A1A]",
            },
            {
              label: "Orders This Month",
              value: fmt(s.ordersThisMonth.amount),
              sub: `${s.ordersThisMonth.count} orders`,
              icon: <Package className="w-5 h-5 stroke-[1.8]" />,
              href: "/admin/orders",
              badgeBg: "bg-[#F3B383] text-[#1A1A1A]",
            },
            {
              label: "Pending Payouts",
              value: fmt(s.pendingPayouts.amount),
              sub: `${s.pendingPayouts.count} pending`,
              icon: <CreditCard className="w-5 h-5 stroke-[1.8]" />,
              href: "/admin/payouts",
              badgeBg: "bg-[#A9E4B0] text-[#1A1A1A]",
            },
          ]);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Admin Command Center"
        subtitle="Platform-wide control panel for Designer's Street"
      />

      {/* Metric Stat Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 rounded-none bg-white/60 animate-pulse border border-[#ECE8DC]" />
              ))
            : stats.map((s) => (
                <AdminStatCard
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  sub={s.sub}
                  icon={s.icon}
                  href={s.href}
                  badgeBg={s.badgeBg}
                />
              ))}
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-[#1A1A1A]">
            Quick Action Hubs
          </h2>
          <span className="text-xs text-[#8A8A8A] font-medium">6 Management Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((a) => (
            <AdminActionHubCard
              key={a.label}
              label={a.label}
              desc={a.desc}
              icon={a.icon}
              href={a.href}
            />
          ))}
        </div>
      </section>

      {/* Studio Banner Shortcut */}
      <section className="bg-[#17181D] text-white rounded-none p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-black">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F6D746]" />
            <span className="text-[#F6D746] font-bold text-xs uppercase tracking-widest">
              Designer Studio Launcher
            </span>
          </div>
          <h3 className="font-display text-xl font-bold text-white">
            Manage Active Designer House
          </h3>
          <p className="text-xs text-[#A0A5B5]">
            Switch house from the top bar dropdown chip to view or edit inventory, orders, and lookbooks.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F6D746] text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#F6D746]/90 transition-all shadow-sm whitespace-nowrap active:scale-95"
        >
          Open Studio
          <ArrowRight className="w-4 h-4 stroke-[2]" />
        </Link>
      </section>
    </div>
  );
}
