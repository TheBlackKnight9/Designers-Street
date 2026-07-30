"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listDashboardProducts } from "@/lib/api/dashboard";

export default function DashboardHomePage() {
  const [counts, setCounts] = useState({
    draft: 0,
    published: 0,
    archived: 0,
    total: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDashboardProducts()
      .then((data) => setCounts(data.counts))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Overview</h1>
          <p className="text-sm text-stone mt-1">
            Manage your catalog and media uploads.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-full bg-charcoal text-paper px-5 py-2.5 text-sm"
        >
          New product
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-800 px-4 py-3 text-sm">
          {error}
          <p className="mt-1 text-xs">
            Ensure USE_DATABASE=true, DATABASE_URL, and Supabase Auth are
            configured.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            ["Total", counts.total],
            ["Draft", counts.draft],
            ["Published", counts.published],
            ["Archived", counts.archived],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-cloud bg-mist/40 p-4"
          >
            <p className="text-xs tracking-label uppercase text-stone">{label}</p>
            <p className="font-display text-3xl mt-2">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {!loading && counts.total === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-cloud px-6 py-12 text-center">
          <p className="font-display text-xl mb-2">No products yet</p>
          <p className="text-sm text-stone mb-4">
            Create your first piece and upload a gallery.
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex rounded-full bg-charcoal text-paper px-5 py-2.5 text-sm"
          >
            Create product
          </Link>
        </div>
      )}
    </div>
  );
}
