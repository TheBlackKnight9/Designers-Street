"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardShell({
  children,
  designerName,
}: {
  children: React.ReactNode;
  designerName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper text-charcoal">
      <header className="border-b border-cloud/80 bg-mist/60 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/dashboard" className="font-display text-lg shrink-0">
              DS Studio
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      active
                        ? "bg-charcoal text-paper"
                        : "text-stone hover:text-charcoal"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {designerName && (
              <span className="hidden md:inline text-stone truncate max-w-[140px]">
                {designerName}
              </span>
            )}
            <Link href="/" className="text-stone hover:text-charcoal">
              Shop
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-stone hover:text-charcoal"
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="sm:hidden flex gap-1 px-4 pb-3 overflow-x-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                  active
                    ? "bg-charcoal text-paper"
                    : "bg-mist text-stone"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
