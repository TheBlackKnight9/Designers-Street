"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
      <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 01-.53 1.28h-1.44v7.94a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5h-2.25v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-7.94H3.31a.75.75 0 01-.53-1.28l8.69-8.69z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        )}
      </svg>
    ),
  },
  {
    label: "Shop",
    href: "/store",
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path d="M5.223 2.25h13.554c1.139 0 2.115.803 2.339 1.917l1.121 5.583c.178.888-.36 1.75-1.237 1.75H3c-.877 0-1.415-.862-1.237-1.75l1.121-5.583A2.394 2.394 0 015.223 2.25zM3 12v8.25A1.5 1.5 0 004.5 21.75h15a1.5 1.5 0 001.5-1.5V12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
        )}
      </svg>
    ),
  },
  {
    label: "Feed",
    href: "/feed",
    isCenter: true,
    icon: () => null,
  },
  {
    label: "Category",
    href: "/category",
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zm0 9.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25v2.25A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
        ) : (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6a2.25 2.25 0 012.25-2.25h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6z" />
          </>
        )}
      </svg>
    ),
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        )}
      </svg>
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
      <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5M4.5 21V10.5" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

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
