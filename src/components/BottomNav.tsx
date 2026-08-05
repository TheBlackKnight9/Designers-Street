"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Store, Compass, LayoutGrid, Heart, Sparkles } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
  isCenter?: boolean;
}

const BUYER_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: (active) => (
      <Home className={`w-5 h-5 ${active ? "text-charcoal fill-charcoal" : "text-stone stroke-[1.8]"}`} />
    ),
  },
  {
    label: "Shop",
    href: "/store",
    icon: (active) => (
      <Store className={`w-5 h-5 ${active ? "text-charcoal stroke-[2.2]" : "text-stone stroke-[1.8]"}`} />
    ),
  },
  {
    label: "Feed",
    href: "/feed",
    isCenter: true,
    icon: () => <Compass className="w-6 h-6 text-[#FF4D9A] stroke-[2]" />,
  },
  {
    label: "Category",
    href: "/category",
    icon: (active) => (
      <LayoutGrid className={`w-5 h-5 ${active ? "text-charcoal stroke-[2.2]" : "text-stone stroke-[1.8]"}`} />
    ),
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: (active) => (
      <Heart className={`w-5 h-5 ${active ? "text-[var(--newme-pink)] fill-[var(--newme-pink)]" : "text-stone stroke-[1.8]"}`} />
    ),
  },
];

const DESIGNER_ITEMS: NavItem[] = [
  BUYER_ITEMS[0],
  BUYER_ITEMS[1],
  BUYER_ITEMS[2],
  BUYER_ITEMS[3],
  {
    label: "Studio",
    href: "/dashboard",
    icon: (active) => (
      <Sparkles className={`w-5 h-5 ${active ? "text-charcoal stroke-[2.2]" : "text-stone stroke-[1.8]"}`} />
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    return null;
  }

  useEffect(() => {
    fetch("/api/account/me")
      .then((res) => res.json())
      .then((body) => {
        if (body?.ok && body.data?.user?.role) {
          setRole(body.data.user.role);
        } else {
          setRole("buyer");
        }
      })
      .catch(() => setRole("buyer"));
  }, []);

  const items = role === "designer" ? DESIGNER_ITEMS : BUYER_ITEMS;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-paper border-t border-[var(--border-subtle)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "var(--safe-area-bottom)" }}
    >
      <div className="relative flex items-end justify-around h-[var(--bottom-nav-height)] px-1">
        {items.map((item) => {
          const isActive = item.isCenter
            ? pathname === item.href || pathname.startsWith(`${item.href}/`)
            : item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.isCenter) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="absolute left-1/2 -translate-x-1/2 -top-3 flex flex-col items-center"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-paper active:scale-95 transition-transform ${
                    isActive ? "bg-[var(--newme-green-dark)] text-paper" : "bg-charcoal text-paper"
                  }`}
                >
                  {item.label === "Feed" ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-[7px] font-extrabold uppercase text-center leading-[1.15] block">
                      {item.label}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1 ${
                    isActive ? "font-extrabold text-[var(--newme-green-dark)]" : "text-stone"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1.5 pb-2 transition-colors ${
                isActive ? "text-[var(--newme-green-dark)]" : "text-stone"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon(isActive)}
              <span className={`text-[10px] font-semibold ${isActive ? "font-extrabold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
