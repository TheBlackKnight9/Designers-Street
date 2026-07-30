"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
            setNotifications(nBody.data.notifications || []);
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

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-24">
        <div className="px-4 pt-5 pb-4">
          <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
            Account
          </h1>
        </div>

        <div className="px-4 pb-6">
          <div className="flex items-center gap-4 p-4 bg-[#F0F0F0] rounded-xl">
            <div className="w-14 h-14 rounded-full bg-[#E0E0E0] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-6 h-6 text-[#A0A0A0]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {loading ? (
                <p className="text-sm text-stone">Loading…</p>
              ) : user ? (
                <>
                  <p className="font-sans text-sm font-semibold text-[#2B2B2B] truncate">
                    {user.name || "Member"}
                  </p>
                  <p className="font-sans text-xs text-[#7A7A7A] truncate">
                    {user.email}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-sans text-sm font-semibold text-[#2B2B2B]">
                    Guest
                  </p>
                  <p className="font-sans text-xs text-[#7A7A7A]">
                    Sign in to view orders and saved details
                  </p>
                </>
              )}
            </div>
          </div>
          {!user && !loading && (
            <div className="mt-3 flex gap-2">
              <Link
                href="/account/login"
                className="flex-1 text-center h-11 leading-[2.75rem] bg-[#2B2B2B] text-[#FAFAFA] text-xs font-semibold uppercase tracking-wider rounded-full"
              >
                Sign in
              </Link>
              <Link
                href="/account/signup"
                className="flex-1 text-center h-11 leading-[2.75rem] border border-[#E0E0E0] text-xs font-semibold uppercase tracking-wider rounded-full"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        <div className="px-4 space-y-3 pb-8">
          {[
            {
              href: "/orders",
              title: "Orders",
              desc: "Track orders and view purchase history.",
              needAuth: true,
            },
            {
              href: "/notifications",
              title: "Notifications",
              desc: "Follows, likes, comments, and order updates.",
              needAuth: true,
            },
            {
              href: "/account/addresses",
              title: "Addresses",
              desc: "Manage delivery addresses.",
              needAuth: true,
            },
            {
              href: "/account/settings",
              title: "Account settings",
              desc: "Edit profile and saved information.",
              needAuth: true,
            },
            {
              href: "/wishlist",
              title: "Wishlist",
              desc: "Pieces you saved for later.",
              needAuth: false,
            },
          ].map((tab) => (
            <Link
              key={tab.href}
              href={
                tab.needAuth && !user
                  ? `/account/login?next=${encodeURIComponent(tab.href)}`
                  : tab.href
              }
              className="block border border-[#E0E0E0] rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-semibold text-[#2B2B2B]">
                  {tab.title}
                </span>
                <svg
                  className="w-4 h-4 text-[#A0A0A0]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
              <p className="font-sans text-xs text-[#7A7A7A] mt-1">{tab.desc}</p>
            </Link>
          ))}

          {user && notifications.length > 0 && (
            <div className="border border-[#E0E0E0] rounded-xl p-4">
              <p className="font-sans text-sm font-semibold text-[#2B2B2B] mb-3">
                Notifications
              </p>
              <ul className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="text-xs">
                    <p className="font-semibold text-charcoal">{n.title}</p>
                    <p className="text-stone mt-0.5">{n.body}</p>
                    {n.orderId && (
                      <Link
                        href={`/orders/${n.orderId}`}
                        className="underline mt-1 inline-block"
                      >
                        View order
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user && (
            <button
              type="button"
              onClick={logout}
              className="w-full border border-[#E0E0E0] rounded-xl p-4 text-left text-sm font-semibold text-[#2B2B2B]"
            >
              Log out
            </button>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
