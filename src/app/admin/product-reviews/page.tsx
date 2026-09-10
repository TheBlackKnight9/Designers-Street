"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  Check,
  X,
  Search,
  ExternalLink,
  Tag,
  Store,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/mock-data";

type ProductReview = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  sizes: string[];
  status: string;
  designer: {
    name: string;
    handle: string;
    listingsApproved: boolean;
  };
};

export default function AdminProductReviewsPage() {
  const [products, setProducts] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/product-reviews");
      const data = await res.json();
      if (data?.ok && Array.isArray(data.data?.products)) {
        setProducts(data.data.products);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleAction(productId: string, action: "approve" | "reject") {
    setProcessingId(productId);
    try {
      const res = await fetch("/api/admin/product-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action }),
      });
      const data = await res.json();
      if (data?.ok) {
        await loadReviews();
      } else {
        alert(data?.error?.message || "Action failed");
      }
    } catch {
      alert("Error processing action");
    } finally {
      setProcessingId(null);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.designer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [products, searchQuery]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Catalog Quality Control & Review"
        subtitle="Verify product descriptions, imagery quality, and sizing specifications before public release"
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          label="Pending QC Queue"
          value={String(products.length)}
          icon={<ShieldCheck className="w-4 h-4 text-zinc-900" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="Avg. Review Latency"
          value="< 4 hours"
          icon={<Sparkles className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="Curation Standard"
          value="Grade A Luxury"
          icon={<Layers className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-950 text-white"
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-medium text-zinc-600">
          Showing <strong className="text-zinc-950">{filteredProducts.length}</strong> items in curation queue
        </span>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, designer, or category..."
            className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Queue Content */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-44 bg-white rounded-xl border border-zinc-200/80 animate-pulse" />
          <div className="h-44 bg-white rounded-xl border border-zinc-200/80 animate-pulse" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-sm font-semibold text-zinc-950">No products awaiting review</p>
          <p className="text-xs text-zinc-500 mt-1">
            {products.length === 0
              ? "All submitted designer listings have been reviewed and published."
              : "No listings match your search query."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-2xs space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/60">
                      <Store className="w-3 h-3 text-zinc-500" />
                      {p.designer.name}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-200/50 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-zinc-400" />
                      {p.category}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-zinc-950">{p.name}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-zinc-950">
                    {formatPrice(p.price)}
                  </span>
                  <AdminStatusBadge status={p.status} />
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
                {p.description || "No description provided."}
              </p>

              {/* Sizes Available */}
              {p.sizes && p.sizes.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <span className="text-[11px] font-medium text-zinc-500">Sizes:</span>
                  <div className="flex flex-wrap gap-1">
                    {p.sizes.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-[11px] font-mono font-medium text-zinc-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Images */}
              {p.images && p.images.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-zinc-500">Asset Gallery ({p.images.length})</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {p.images.map((img, i) => (
                      <a
                        key={i}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="relative aspect-3/4 rounded-lg overflow-hidden border border-zinc-200/80 block group bg-zinc-100 hover:border-zinc-400 transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions Footer */}
              <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/admin/products?search=${encodeURIComponent(p.name)}`}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
                >
                  <span>Inspect in Catalog</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={processingId === p.id}
                    onClick={() => handleAction(p.id, "reject")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 text-xs font-medium rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject Listing
                  </button>

                  <button
                    type="button"
                    disabled={processingId === p.id}
                    onClick={() => handleAction(p.id, "approve")}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve & Publish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
