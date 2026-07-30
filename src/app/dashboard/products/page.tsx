"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  deleteDashboardProduct,
  listDashboardProducts,
  setDashboardProductStatus,
} from "@/lib/api/dashboard";
import type { Product } from "@/lib/types";
import type { ProductStatus } from "@prisma/client";
import { useToast } from "@/components/dashboard/Toast";

type Row = Product & { status?: ProductStatus };

export default function DashboardProductsPage() {
  const { push } = useToast();
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [products, setProducts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(nextStatus: ProductStatus | "all" = status) {
    setLoading(true);
    setError(null);
    try {
      const data = await listDashboardProducts(
        nextStatus === "all" ? undefined : nextStatus
      );
      setProducts(data.products as Row[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-stone mt-1">
            Create, edit, publish, and archive your catalog.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-full bg-charcoal text-paper px-5 py-2.5 text-sm"
        >
          New product
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "draft", "published", "archived"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              void load(s);
            }}
            className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-label ${
              status === s
                ? "bg-charcoal text-paper"
                : "bg-mist text-stone"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-mist animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cloud px-6 py-12 text-center">
          <p className="text-stone text-sm">No products in this filter.</p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-cloud overflow-hidden bg-paper"
            >
              <Link href={`/dashboard/products/${p.id}`} className="block">
                <div className="relative aspect-[4/5] bg-mist">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="300px"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-stone">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-label text-stone">
                    {p.status || "draft"}
                  </p>
                  <h2 className="font-display text-lg leading-tight mt-1">
                    {p.name}
                  </h2>
                  <p className="text-sm mt-1">₹{p.price}</p>
                </div>
              </Link>
              <div className="px-3 pb-3 flex gap-2">
                <button
                  type="button"
                  className="flex-1 text-xs rounded-lg border border-cloud py-1.5"
                  onClick={async () => {
                    try {
                      await setDashboardProductStatus(
                        p.id,
                        p.status === "published" ? "draft" : "published"
                      );
                      push("Status updated");
                      void load(status);
                    } catch (err) {
                      push(
                        err instanceof Error ? err.message : "Failed",
                        "err"
                      );
                    }
                  }}
                >
                  {p.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  className="flex-1 text-xs rounded-lg bg-red-700 text-white py-1.5"
                  onClick={async () => {
                    if (!confirm(`Delete “${p.name}”?`)) return;
                    try {
                      await deleteDashboardProduct(p.id);
                      push("Product deleted");
                      void load(status);
                    } catch (err) {
                      push(
                        err instanceof Error ? err.message : "Failed",
                        "err"
                      );
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
