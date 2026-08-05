"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Check, X } from "lucide-react";
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

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Product Listing QC Queue"
        subtitle="Review and quality-control first listings before marketplace publication"
      />

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 bg-white/70 animate-pulse rounded-2xl border border-[#ECE8DC]" />
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[#ECE8DC] bg-white">
          <p className="text-sm font-bold text-[#1A1A1A]">No products awaiting quality review</p>
          <p className="text-xs text-[#8A8A8A] mt-1 font-medium">All designer product listings have passed QC inspection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-2xl border border-[#ECE8DC] space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECE8DC] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] bg-[#F6D746] px-2.5 py-0.5 rounded-full inline-block mb-1">
                    {p.designer.name}
                  </span>
                  <h2 className="font-display text-lg font-bold text-[#1A1A1A]">
                    {p.name}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-[#1A1A1A]">
                    {formatPrice(p.price)}
                  </span>
                  <AdminStatusBadge status={p.status} />
                </div>
              </div>

              <p className="text-xs text-[#1A1A1A]">{p.description}</p>

              {/* Media Images */}
              {p.images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {p.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#ECE8DC] block group bg-[#F4F0E5]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              )}

              {/* Admin Actions */}
              <div className="pt-3 border-t border-[#ECE8DC] flex gap-2">
                <button
                  type="button"
                  disabled={processingId === p.id}
                  onClick={() => handleAction(p.id, "approve")}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#F6D746] text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-2xs hover:bg-[#F6D746]/90 disabled:opacity-60 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[2]" />
                  Approve Listing
                </button>
                <button
                  type="button"
                  disabled={processingId === p.id}
                  onClick={() => handleAction(p.id, "reject")}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-red-700 font-sans text-xs font-bold uppercase rounded-full hover:bg-red-50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Reject Listing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
