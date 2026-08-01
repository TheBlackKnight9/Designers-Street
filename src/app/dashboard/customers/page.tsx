"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/dashboard/Toast";

type Follower = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  followedAt: string;
};

type Buyer = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  totalOrders: number;
  lastOrderDate: string;
};

function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

export default function DesignerCustomersPage() {
  const { push } = useToast();
  const [tab, setTab] = useState<"buyers" | "followers">("buyers");
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/customers")
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok) {
          setBuyers(body.data?.buyers || []);
          setFollowers(body.data?.followers || []);
        }
      })
      .catch(() => push("Failed to load customer insights", "err"))
      .finally(() => setLoading(false));
  }, [push]);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-stone animate-pulse">
        Loading audience insights...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Audience &amp; Customers
          </h1>
          <p className="text-xs text-stone mt-1">
            Insights on buyers and house followers
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-mist rounded-full border border-cloud">
          <button
            type="button"
            onClick={() => setTab("buyers")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === "buyers"
                ? "bg-charcoal text-paper"
                : "text-stone hover:text-charcoal"
            }`}
          >
            Buyers ({buyers.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("followers")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === "followers"
                ? "bg-charcoal text-paper"
                : "text-stone hover:text-charcoal"
            }`}
          >
            Followers ({followers.length})
          </button>
        </div>
      </div>

      {tab === "buyers" ? (
        buyers.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-cloud bg-mist/30">
            <p className="text-sm font-semibold text-charcoal">No buyers recorded yet</p>
            <p className="text-xs text-stone mt-1">
              Customers who purchase garments from your store will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buyers.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-cloud bg-paper flex items-center gap-4 shadow-sm"
              >
                <div className="relative w-10 h-10 rounded-full bg-mist overflow-hidden shrink-0 flex items-center justify-center font-bold text-stone text-sm">
                  {isValidImageUrl(b.avatarUrl) ? (
                    <Image src={b.avatarUrl!} alt={b.name} fill className="object-cover" />
                  ) : (
                    b.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-charcoal truncate">{b.name}</p>
                  <p className="text-[10px] text-stone truncate">{b.email}</p>
                  <p className="text-[10px] font-semibold text-charcoal mt-1">
                    {b.totalOrders} order{b.totalOrders > 1 ? "s" : ""} · Last:{" "}
                    {new Date(b.lastOrderDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : followers.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-cloud bg-mist/30">
          <p className="text-sm font-semibold text-charcoal">No followers recorded yet</p>
          <p className="text-xs text-stone mt-1">
            Users who follow your house profile will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followers.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-2xl border border-cloud bg-paper flex items-center gap-4 shadow-sm"
            >
              <div className="relative w-10 h-10 rounded-full bg-mist overflow-hidden shrink-0 flex items-center justify-center font-bold text-stone text-sm">
                {isValidImageUrl(f.avatarUrl) ? (
                  <Image src={f.avatarUrl!} alt={f.name} fill className="object-cover" />
                ) : (
                  f.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-charcoal truncate">{f.name}</p>
                <p className="text-[10px] text-stone truncate">{f.email}</p>
                <p className="text-[10px] text-stone mt-1">
                  Following since {new Date(f.followedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
