"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { createClient } from "@/lib/supabase/client";

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
};

type ProfileLink = {
  href: string;
  title: string;
  desc: string;
  needAuth: boolean;
};

const QUICK: ProfileLink[] = [
  {
    href: "/orders",
    title: "Orders",
    desc: "Track & history",
    needAuth: true,
  },
  {
    href: "/wishlist",
    title: "Wishlist",
    desc: "Saved pieces",
    needAuth: false,
  },
  {
    href: "/profile/addresses",
    title: "Addresses",
    desc: "Delivery pins",
    needAuth: true,
  },
];

const MENU: ProfileLink[] = [
  {
    href: "/notifications",
    title: "Notifications",
    desc: "Follows, likes, comments, and order updates.",
    needAuth: true,
  },
  {
    href: "/profile/measurements",
    title: "Measurement Profiles",
    desc: "Custom fit profiles for 1-click size match.",
    needAuth: true,
  },
  {
    href: "/account/settings",
    title: "Account settings",
    desc: "Edit profile and saved information.",
    needAuth: true,
  },
];

function MenuIcon({ name }: { name: string }) {
  const common = "w-5 h-5";
  if (name === "Orders") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    );
  }
  if (name === "Wishlist") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  }
  if (name === "Addresses") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  return (
    <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/account/me");
        const body = await res.json();
        if (res.ok && body?.ok) {
          if (!cancelled) setUser(body.data.user);
          const nRes = await fetch("/api/notifications");
          const nBody = await nRes.json();
          if (nRes.ok && nBody?.ok && !cancelled) {
            const list = (nBody.data.notifications || []) as Notification[];
            setNotifications(list);
            setUnread(list.filter((n) => !n.readAt).length);
          }
        }
      } catch {
        /* guest */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const initials =
    (user?.name || user?.email || "DS")
      .split(/\s+|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "DS";

  function hrefFor(item: ProfileLink) {
    return item.needAuth && !user
      ? `/account/login?next=${encodeURIComponent(item.href)}`
      : item.href;
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-transparent pb-28">
        {/* Editorial identity band */}
        <section className="relative overflow-hidden bg-espresso text-chip">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 90% 70% at 85% -10%, rgba(166,124,82,0.45), transparent 55%), radial-gradient(ellipse 60% 50% at 10% 100%, rgba(255,255,255,0.06), transparent 50%)",
            }}
          />
          <div className="relative max-w-lg mx-auto px-5 pt-10 pb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-bronze mb-5">
              Your Atelier
            </p>

            <div className="flex items-end gap-4">
              <div className="w-16 h-16 rounded-full bg-bronze/90 ring-2 ring-white/15 flex items-center justify-center flex-shrink-0 overflow-hidden text-[#1A120C] font-extrabold text-xl">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1 pb-0.5">
                {loading ? (
                  <p className="text-sm text-white/50 animate-pulse">Loading account…</p>
                ) : user ? (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-sans text-[1.45rem] font-extrabold tracking-tight truncate leading-none">
                        {user.name || "Member"}
                      </h1>
                      {user.role === "admin" && (
                        <span className="px-2 py-0.5 bg-bronze text-[#1A120C] text-[9px] font-bold uppercase tracking-wider rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[13px] text-white/55 truncate">{user.email}</p>
                  </>
                ) : (
                  <>
                    <h1 className="font-sans text-[1.45rem] font-extrabold tracking-tight leading-none">
                      Guest Connoisseur
                    </h1>
                    <p className="mt-1.5 text-[13px] text-white/55 leading-snug">
                      Continue with Google — no password needed
                    </p>
                  </>
                )}
              </div>
            </div>

            {!user && !loading && (
              <div className="mt-7 flex flex-col gap-2.5">
                <Link
                  href="/account/login?next=/profile"
                  className="w-full text-center py-3 rounded-full bg-bronze text-[#1A120C] text-[11px] font-extrabold uppercase tracking-[0.12em] shadow-[0_6px_20px_rgba(166,124,82,0.35)]"
                >
                  Continue with Google
                </Link>
                <Link
                  href="/account/signup?next=/profile"
                  className="w-full text-center py-3 rounded-full border border-white/25 text-chip text-[11px] font-extrabold uppercase tracking-[0.12em] hover:bg-white/10 transition-colors"
                >
                  Or join with email
                </Link>
              </div>
            )}

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm hover:bg-white/15 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] active:scale-[0.98]"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                    Admin Studio
                  </p>
                  <p className="text-[12px] text-white/70 mt-1 font-medium">
                    Houses, products &amp; orders
                  </p>
                </div>
                <div className="bg-[#d4af37]/15 border border-[#d4af37]/30 rounded-full px-4 py-1.5 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4af37]">
                    Open
                  </span>
                </div>
              </Link>
            )}
          </div>
        </section>

        <div className="max-w-lg mx-auto px-5 pt-6 pb-10 space-y-8">
          {/* Quick destinations */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone mb-3">
              Shortcuts
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {QUICK.map((item) => (
                <Link
                  key={item.href}
                  href={hrefFor(item)}
                  className="flex flex-col items-center gap-2.5 rounded-[1.25rem] bg-chip border border-espresso/10 px-2 py-4 text-center shadow-[0_2px_10px_rgba(42,31,24,0.05)] active:scale-[0.98] transition"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso/5 text-espresso">
                    <MenuIcon name={item.title} />
                  </span>
                  <span>
                    <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-charcoal">
                      {item.title}
                    </span>
                    <span className="block text-[10px] text-stone mt-0.5">{item.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Account list — single surface, hairline rows */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone mb-3">
              Account
            </p>
            <div className="rounded-[1.35rem] bg-chip border border-espresso/10 overflow-hidden shadow-[0_2px_12px_rgba(42,31,24,0.05)]">
              {MENU.map((item, i) => {
                const showBadge = item.href === "/notifications" && unread > 0;
                return (
                  <Link
                    key={item.href}
                    href={hrefFor(item)}
                    className={`flex items-center gap-3 px-4 py-4 hover:bg-canvas-soft/60 active:bg-canvas-soft transition-colors ${
                      i > 0 ? "border-t border-espresso/8" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-charcoal">{item.title}</span>
                        {showBadge && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-bronze text-[#1A120C] text-[9px] font-bold flex items-center justify-center">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-stone mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-espresso/35 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Recent activity */}
          {user && notifications.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone">
                  Recent
                </p>
                <Link
                  href="/notifications"
                  className="text-[11px] font-bold uppercase tracking-[0.1em] text-bronze-deep"
                >
                  See all
                </Link>
              </div>
              <ul className="space-y-0 border-l-2 border-espresso/15 ml-1.5 pl-4">
                {notifications.slice(0, 3).map((n) => (
                  <li key={n.id} className="relative pb-5 last:pb-0">
                    <span className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-bronze ring-4 ring-canvas" />
                    <p className="text-[13px] font-semibold text-charcoal">{n.title}</p>
                    <p className="text-[12px] text-stone mt-0.5 line-clamp-2 leading-relaxed">
                      {n.body}
                    </p>
                    {n.orderId && (
                      <Link
                        href={`/orders/${n.orderId}`}
                        className="inline-block mt-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-espresso underline underline-offset-2"
                      >
                        View order
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Footer links */}
          <section className="pt-2 border-t border-espresso/10">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone">
              <Link href="/terms" className="hover:text-charcoal transition-colors">
                Terms
              </Link>
              <span className="text-espresso/20">·</span>
              <Link href="/privacy" className="hover:text-charcoal transition-colors">
                Privacy
              </Link>
              <span className="text-espresso/20">·</span>
              <Link href="/cookies" className="hover:text-charcoal transition-colors">
                Cookies
              </Link>
            </div>

            {user && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-3.5 flex justify-center items-center gap-2 rounded-xl border border-red-900/10 bg-red-50 text-[11px] font-extrabold uppercase tracking-[0.15em] text-red-600 shadow-sm hover:bg-red-100 hover:border-red-900/20 active:scale-[0.98] transition-all"
                >
                  <svg className="w-4 h-4 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
