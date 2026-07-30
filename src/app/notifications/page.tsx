"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  orderId?: string | null;
  postId?: string | null;
  productId?: string | null;
  designerId?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications");
      const body = await res.json();
      if (res.status === 401) {
        setUnauthorized(true);
        setItems([]);
        return;
      }
      if (!res.ok || body?.ok === false) {
        throw new Error(body?.error?.message || "Failed to load");
      }
      setItems(body.data.notifications || []);
      setUnauthorized(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    await load();
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${encodeURIComponent(id)}`, {
      method: "PATCH",
    });
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n
      )
    );
  }

  function hrefFor(n: NotificationRow): string | null {
    if (n.orderId) return `/orders/${n.orderId}`;
    if (n.productId) return `/product/${n.productId}`;
    if (n.postId) return `/feed`;
    return null;
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-16 bg-[#FDFCF8]">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
              Notifications
            </h1>
            <p className="font-sans text-xs text-[#7A7A7A] mt-0.5">
              Orders and social activity
            </p>
          </div>
          {items.some((n) => !n.readAt) && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="font-sans text-[10px] font-bold uppercase tracking-wider underline text-[#2B2B2B]"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="px-4 space-y-3 pb-8">
          {unauthorized && (
            <div className="border border-[#E0E0E0] rounded-xl p-4 text-center">
              <p className="text-sm text-[#4A4A4A] mb-3">
                Sign in to see your notifications.
              </p>
              <Link
                href="/account/login?next=/notifications"
                className="inline-block px-4 py-2 bg-[#2B2B2B] text-white text-xs font-bold uppercase tracking-wider rounded-full"
              >
                Sign in
              </Link>
            </div>
          )}
          {loading && (
            <p className="text-sm text-[#7A7A7A]">Loading…</p>
          )}
          {error && (
            <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {!loading && !unauthorized && items.length === 0 && (
            <p className="text-sm text-[#7A7A7A]">No notifications yet.</p>
          )}
          {items.map((n) => {
            const href = hrefFor(n);
            const unread = !n.readAt;
            const content = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-sans text-sm font-semibold text-[#2B2B2B]">
                    {n.title}
                  </p>
                  {unread && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-[#2B2B2B] mt-1.5" aria-label="Unread" />
                  )}
                </div>
                <p className="font-sans text-xs text-[#7A7A7A] mt-1">{n.body}</p>
                <p className="font-sans text-[10px] text-[#A0A0A0] mt-2 uppercase tracking-wider">
                  {n.type.replace(/_/g, " ")}
                </p>
              </>
            );
            return (
              <div
                key={n.id}
                className={`border rounded-xl p-4 ${
                  unread ? "border-[#2B2B2B]/20 bg-white" : "border-[#E0E0E0]"
                }`}
              >
                {href ? (
                  <Link
                    href={href}
                    onClick={() => void markRead(n.id)}
                    className="block"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={() => void markRead(n.id)}
                  >
                    {content}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
