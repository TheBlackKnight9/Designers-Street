"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type House = { id: string; name: string; handle: string };

export function AdminHouseSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok && body.data?.user?.role === "admin") {
          setIsAdmin(true);

          // Restore active house from cookie
          const match = document.cookie.match(/admin_active_designer_id=([^;]+)/);
          const cookieId = match?.[1] ?? "";
          if (cookieId) setActiveId(cookieId);

          // Fetch all houses from admin-only endpoint
          fetch("/api/admin/designers")
            .then((r) => r.json())
            .then((d) => {
              if (d?.ok && Array.isArray(d.data?.houses)) {
                const list: House[] = d.data.houses
                  .filter((h: House & { accountStatus: string }) => h.accountStatus === "active")
                  .map((h: House) => ({ id: h.id, name: h.name, handle: h.handle }));
                setHouses(list);
                // Auto-select first if none saved
                if (!cookieId && list.length > 0) {
                  setActiveId(list[0].id);
                  document.cookie = `admin_active_designer_id=${list[0].id}; path=/; max-age=86400`;
                }
              }
            })
            .catch(() => undefined);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  function handleSelectHouse(id: string) {
    setActiveId(id);
    document.cookie = `admin_active_designer_id=${id}; path=/; max-age=86400`;
    router.refresh();
  }

  if (loading || !isAdmin) return null;

  const activeName = houses.find((h) => h.id === activeId)?.name ?? "No House Selected";

  return (
    <div className="bg-[#1a1a1a] text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-[100] shadow-lg border-b border-yellow-600/30">
      {/* Left: Badge + House Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="bg-yellow-500/20 text-yellow-400 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-widest border border-yellow-500/30 whitespace-nowrap">
          👑 Admin
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/50 font-semibold hidden sm:block whitespace-nowrap">
            Active House:
          </span>
          <select
            value={activeId}
            onChange={(e) => handleSelectHouse(e.target.value)}
            className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-lg text-xs font-bold outline-none cursor-pointer hover:bg-white/15 transition-colors max-w-[180px]"
            title={activeName}
          >
            <option value="" className="bg-gray-900">Select House…</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id} className="bg-gray-900">
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Nav links */}
      <div className="flex items-center gap-1 text-[11px] font-semibold">
        {[
          { label: "+ House", href: "/admin/designers" },
          { label: "Houses", href: "/admin/designers" },
          { label: "Catalog", href: "/admin/products" },
          { label: "Orders", href: "/admin/orders" },
          { label: "Leads", href: "/admin/concept-leads" },
          { label: "Payouts", href: "/admin/payouts" },
          { label: "Studio", href: "/dashboard" },
        ].map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label + item.href}
              href={item.href}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/store"
          className="text-white/40 hover:text-white px-2 py-1 transition-colors whitespace-nowrap"
        >
          Store ↗
        </Link>
      </div>
    </div>
  );
}
