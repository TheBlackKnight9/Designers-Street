"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/mock-data";

type AnalyticsData = {
  metrics: {
    productsPublished: number;
    ordersReceived: number;
    followersCount: number;
    likesCount: number;
    profileViews: number;
    productViews: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    price: number;
    recentPurchaseCount: number;
    images: string[];
  }>;
};

function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

export default function DashboardHomePage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/analytics")
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok && body.data) {
          setAnalytics(body.data);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      )
      .finally(() => setLoading(false));
  }, []);

  const m = analytics?.metrics;
  const productsCount = m?.productsPublished ?? 0;

  return (
    <div className="space-y-8">
      {/* Page Title & Main Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-charcoal">
            Studio Overview
          </h1>
          <p className="text-xs text-stone mt-1">
            Performance analytics, quick actions, and studio status
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/products/new"
            className="rounded-full bg-charcoal text-paper px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
          >
            + New Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-800 px-4 py-3 text-xs">
          {error}
        </div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(
          [
            ["Products", loading ? "—" : m?.productsPublished ?? 0],
            ["Orders", loading ? "—" : m?.ordersReceived ?? 0],
            ["Followers", loading ? "—" : m?.followersCount ?? 0],
            ["Likes", loading ? "—" : m?.likesCount ?? 0],
            ["Profile Views", loading ? "—" : m?.profileViews ?? 0],
            ["Product Views", loading ? "—" : m?.productViews ?? 0],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-cloud bg-paper p-4 shadow-sm"
          >
            <p className="text-[10px] font-bold tracking-wider uppercase text-stone">{label}</p>
            <p className="font-display text-2xl font-bold text-charcoal mt-1">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Studio Quick Actions Bar */}
      <div className="p-5 rounded-2xl border border-cloud bg-paper shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal">Studio Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/profile"
            className="px-4 py-2 rounded-full border border-cloud bg-mist hover:bg-cloud/40 transition-colors text-xs font-bold uppercase tracking-wider text-charcoal"
          >
            Complete Profile
          </Link>
          <Link
            href="/dashboard/products/new"
            className="px-4 py-2 rounded-full border border-cloud bg-mist hover:bg-cloud/40 transition-colors text-xs font-bold uppercase tracking-wider text-charcoal"
          >
            Upload Product
          </Link>
          <Link
            href="/dashboard/lookbooks"
            className="px-4 py-2 rounded-full border border-cloud bg-mist hover:bg-cloud/40 transition-colors text-xs font-bold uppercase tracking-wider text-charcoal"
          >
            Create Lookbook
          </Link>
          <Link
            href="/dashboard/orders"
            className="px-4 py-2 rounded-full border border-cloud bg-mist hover:bg-cloud/40 transition-colors text-xs font-bold uppercase tracking-wider text-charcoal"
          >
            Orders Timeline
          </Link>
          <Link
            href="/dashboard/customers"
            className="px-4 py-2 rounded-full border border-cloud bg-mist hover:bg-cloud/40 transition-colors text-xs font-bold uppercase tracking-wider text-charcoal"
          >
            Audience Insights
          </Link>
        </div>
      </div>

      {/* Zero Products Empty State Shelf */}
      {!loading && productsCount === 0 && (
        <div className="p-8 rounded-3xl border border-dashed border-cloud bg-mist/30 text-center space-y-3">
          <p className="font-display text-xl font-bold text-charcoal">No products published yet</p>
          <p className="text-xs text-stone max-w-md mx-auto">
            Upload your luxury garments and couture pieces to make them discoverable on Designer&apos;s Street.
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-block px-6 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full"
          >
            Upload First Collection
          </Link>
        </div>
      )}

      {/* Top Products Shelf */}
      {analytics?.topProducts && analytics.topProducts.length > 0 && (
        <div className="p-5 rounded-2xl border border-cloud bg-paper shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal">Top Performing Pieces</h2>
            <Link href="/dashboard/products" className="text-[10px] font-bold uppercase tracking-wider text-stone hover:text-charcoal">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {analytics.topProducts.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/products/${p.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-mist/50 hover:bg-mist transition-colors border border-cloud/40"
              >
                <div className="relative w-12 h-14 rounded-lg bg-mist overflow-hidden shrink-0 flex items-center justify-center font-bold text-stone text-[10px]">
                  {isValidImageUrl(p.images[0]) ? (
                    <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                  ) : (
                    p.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-charcoal truncate">{p.name}</p>
                  <p className="text-[10px] text-stone mt-0.5">{formatPrice(p.price)}</p>
                  <p className="text-[10px] font-semibold text-charcoal mt-0.5">{p.recentPurchaseCount} sold</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/orders"
          className="p-5 rounded-2xl border border-cloud bg-paper hover:border-charcoal transition-colors shadow-sm space-y-2"
        >
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-charcoal text-paper rounded-full">
            Fulfillment
          </span>
          <h3 className="text-sm font-bold text-charcoal pt-1">Orders Management</h3>
          <p className="text-xs text-stone">
            Process buyer orders and update status along the fulfillment timeline.
          </p>
        </Link>

        <Link
          href="/dashboard/lookbooks"
          className="p-5 rounded-2xl border border-cloud bg-paper hover:border-charcoal transition-colors shadow-sm space-y-2"
        >
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-charcoal text-paper rounded-full">
            Editorial
          </span>
          <h3 className="text-sm font-bold text-charcoal pt-1">Lookbook CMS</h3>
          <p className="text-xs text-stone">
            Curate seasonal campaigns and link your catalog products.
          </p>
        </Link>

        <Link
          href="/dashboard/profile"
          className="p-5 rounded-2xl border border-cloud bg-paper hover:border-charcoal transition-colors shadow-sm space-y-2"
        >
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-charcoal text-paper rounded-full">
            Brand
          </span>
          <h3 className="text-sm font-bold text-charcoal pt-1">Brand Profile</h3>
          <p className="text-xs text-stone">
            Update designer story, signature techniques, website, and social links.
          </p>
        </Link>
      </div>
    </div>
  );
}
