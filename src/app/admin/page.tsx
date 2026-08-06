"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stat = {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  href: string;
  color: string;
};

const QUICK_ACTIONS = [
  { label: "Designer Houses", icon: "🏛️", href: "/admin/designers", desc: "Create & manage all houses" },
  { label: "Products Catalog", icon: "👗", href: "/admin/products", desc: "All products across houses" },
  { label: "Orders", icon: "📦", href: "/admin/orders", desc: "Track all platform orders" },
  { label: "Content Studio", icon: "🎬", href: "/dashboard/posts", desc: "Posts, stories & lookbooks" },
  { label: "Concept Leads", icon: "🎨", href: "/admin/concept-leads", desc: "Bespoke & concept inquiries" },
  { label: "Payouts", icon: "💳", href: "/admin/payouts", desc: "Manage designer earnings" },
  { label: "Applications", icon: "📋", href: "/admin/applications", desc: "Designer applications" },
];

function fmt(n: number) {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHouse, setActiveHouse] = useState<string>("");

  useEffect(() => {
    // Get active house name from cookie for display
    const cookieMatch = document.cookie.match(/admin_active_designer_id=([^;]+)/);
    if (cookieMatch) setActiveHouse(cookieMatch[1]);

    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok && body.data?.stats) {
          const s = body.data.stats;
          setStats([
            {
              label: "Active Houses",
              value: String(s.totalHouses),
              icon: "🏛️",
              href: "/admin/designers",
              color: "bg-charcoal text-paper",
            },
            {
              label: "Published Products",
              value: String(s.totalProducts),
              icon: "👗",
              href: "/admin/products",
              color: "bg-white border border-cloud text-charcoal",
            },
            {
              label: "Orders This Month",
              value: fmt(s.ordersThisMonth.amount),
              sub: `${s.ordersThisMonth.count} orders`,
              icon: "📦",
              href: "/admin/orders",
              color: "bg-white border border-cloud text-charcoal",
            },
            {
              label: "Pending Payouts",
              value: fmt(s.pendingPayouts.amount),
              sub: `${s.pendingPayouts.count} pending`,
              icon: "💳",
              href: "/admin/payouts",
              color: "bg-gold/10 border border-gold/30 text-charcoal",
            },
          ]);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone mb-1">
            Admin Command Center
          </p>
          <h1 className="font-display text-3xl font-bold text-charcoal">
            Designer&apos;s Street Platform
          </h1>
          {activeHouse && (
            <p className="text-xs text-stone mt-1">
              Active house cookie:{" "}
              <span className="font-mono text-charcoal font-bold">{activeHouse.slice(0, 20)}…</span>
            </p>
          )}
        </div>
        <Link
          href="/admin/designers"
          className="px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black transition-colors shadow-sm"
        >
          + New Designer House
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-mist animate-pulse" />
            ))
          : stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={`${s.color} rounded-2xl p-5 flex flex-col gap-1 hover:scale-[1.02] transition-transform shadow-xs`}
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="font-display text-2xl font-bold leading-tight">
                  {s.value}
                </span>
                {s.sub && (
                  <span className="text-[10px] font-semibold opacity-60 uppercase tracking-wider">
                    {s.sub}
                  </span>
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 mt-auto">
                  {s.label}
                </span>
              </Link>
            ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-lg font-bold uppercase text-charcoal mb-4 tracking-tight">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="p-5 bg-white border border-cloud rounded-2xl hover:border-charcoal hover:shadow-sm transition-all group"
            >
              <span className="text-2xl block mb-2">{a.icon}</span>
              <p className="font-bold text-sm text-charcoal group-hover:underline">{a.label}</p>
              <p className="text-xs text-stone mt-0.5">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Studio Shortcut */}
      <div className="bg-charcoal rounded-3xl p-6 flex items-center justify-between">
        <div>
          <p className="text-gold font-bold text-xs uppercase tracking-widest mb-1">Designer Studio</p>
          <p className="text-paper text-lg font-display font-bold">
            Manage the active house
          </p>
          <p className="text-cloud/70 text-xs mt-1">
            Switch house from the 👑 bar above, then go to the studio
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-3 bg-gold text-charcoal text-xs font-bold uppercase tracking-wider rounded-full hover:bg-gold/90 transition-colors whitespace-nowrap"
        >
          Open Studio →
        </Link>
      </div>
    </main>
  );
}
