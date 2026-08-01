"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

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
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-24 px-4 pt-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/applications" className="text-xs text-stone hover:text-charcoal font-semibold">
              ← Applications Queue
            </Link>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-charcoal mt-1">
              Product Listing QC Queue
            </h1>
            <p className="text-xs text-stone">Review and quality-control first listings before marketplace publish</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-40 bg-mist animate-pulse rounded-3xl" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-cloud bg-white">
            <p className="text-sm font-semibold text-charcoal">No products awaiting quality review</p>
            <p className="text-xs text-stone mt-1">All designer product listings have passed QC inspection</p>
          </div>
        ) : (
          <div className="space-y-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cloud pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-charcoal px-2.5 py-1 rounded-md">
                      {p.designer.name}
                    </span>
                    <h2 className="font-display text-lg font-bold text-charcoal mt-1">
                      {p.name} · <span className="font-mono text-sm">₹{p.price.toLocaleString("en-IN")}</span>
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                    Pending QC Review
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {p.images[0] && (
                    <div className="relative aspect-3/4 rounded-2xl overflow-hidden border border-cloud">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="sm:col-span-3 space-y-2 text-xs text-charcoal">
                    <p><strong className="uppercase text-stone text-[10px] block">Category:</strong> {p.category}</p>
                    <p><strong className="uppercase text-stone text-[10px] block">Description:</strong> {p.description}</p>
                    <p><strong className="uppercase text-stone text-[10px] block">Available Sizes:</strong> {p.sizes.join(", ")}</p>

                    <div className="pt-3 border-t border-cloud flex gap-2">
                      <button
                        type="button"
                        disabled={processingId === p.id}
                        onClick={() => handleAction(p.id, "approve")}
                        className="px-6 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-black disabled:opacity-60"
                      >
                        ✓ Approve &amp; Publish Listing
                      </button>
                      <button
                        type="button"
                        disabled={processingId === p.id}
                        onClick={() => handleAction(p.id, "reject")}
                        className="px-5 py-2.5 text-red-700 font-sans text-xs font-bold uppercase rounded-full hover:bg-red-50"
                      >
                        Reject to Draft
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
