"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/inventory", label: "Inventory Studio" },
  { href: "/dashboard/posts", label: "Posts" },
  { href: "/dashboard/stories", label: "Stories" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/lookbooks", label: "Lookbooks" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings/verification", label: "KYC Verification" },
];

export function DashboardShell({
  children,
  designerName,
}: {
  children: React.ReactNode;
  designerName?: string;
}) {
  const pathname = usePathname();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-cloud p-5 flex flex-col justify-between shrink-0 bg-mist/30">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] tracking-label uppercase text-stone block">
              Designer Studio
            </span>
            <p className="font-display text-lg font-bold text-charcoal truncate">
              {designerName || "My House"}
            </p>
          </div>
          <nav className="flex flex-row md:flex-col flex-wrap gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                    active
                      ? "bg-charcoal text-paper"
                      : "text-stone hover:bg-cloud/40"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-cloud/60 mt-6 hidden md:block">
          <button
            type="button"
            onClick={logout}
            className="text-xs text-stone hover:text-charcoal font-semibold uppercase tracking-wider"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
