"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

type Application = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantCity: string;
  brandName: string;
  brandStory: string;
  designPhilosophy: string | null;
  portfolioImages: string[];
  instagramHandle: string | null;
  websiteUrl: string | null;
  categories: string[];
  priceRange: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "more_info_needed";
  createdAt: string;
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications?status=${filter}`);
      const data = await res.json();
      if (data?.ok && Array.isArray(data.data?.applications)) {
        setApplications(data.data.applications);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, [filter]);

  async function handleAction(applicationId: string, action: "approve" | "reject" | "more_info") {
    setProcessingId(applicationId);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action }),
      });
      const data = await res.json();
      if (data?.ok) {
        await loadApplications();
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
            <Link href="/admin" className="text-xs text-stone hover:text-charcoal font-semibold">
              ← Admin Portal
            </Link>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-charcoal mt-1">
              Designer Applications Queue
            </h1>
            <p className="text-xs text-stone">Review and curate prospective brand applicants</p>
          </div>
          <Link
            href="/admin/product-reviews"
            className="px-4 py-2 border border-charcoal text-charcoal font-sans text-xs font-bold uppercase rounded-full hover:bg-mist"
          >
            Product Listing QC →
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-cloud">
          {["pending", "approved", "rejected", "more_info_needed", "all"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
                filter === st
                  ? "bg-charcoal text-paper"
                  : "bg-white text-stone border border-cloud hover:bg-mist"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-40 bg-mist animate-pulse rounded-3xl" />
            <div className="h-40 bg-mist animate-pulse rounded-3xl" />
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-cloud bg-white">
            <p className="text-sm font-semibold text-charcoal">No applications found in this queue</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cloud pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-charcoal px-2.5 py-1 rounded-md">
                      {app.brandName}
                    </span>
                    <h2 className="font-display text-lg font-bold text-charcoal mt-1">
                      {app.applicantName} · <span className="text-stone font-normal text-xs">{app.applicantCity}</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone">{app.applicantEmail} · {app.applicantPhone}</span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-mist border border-cloud">
                      {app.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-charcoal">
                  <p><strong className="uppercase text-stone text-[10px] block">Founding Story:</strong> {app.brandStory}</p>
                  {app.designPhilosophy && (
                    <p><strong className="uppercase text-stone text-[10px] block">Philosophy:</strong> {app.designPhilosophy}</p>
                  )}

                  <div className="flex flex-wrap gap-4 pt-1">
                    <div>
                      <span className="uppercase text-stone text-[10px] block">Categories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.categories.map((c) => (
                          <span key={c} className="px-2 py-0.5 bg-mist text-[10px] font-bold rounded-md">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="uppercase text-stone text-[10px] block">Price Segment:</span>
                      <span className="font-bold text-charcoal">{app.priceRange}</span>
                    </div>
                    {app.instagramHandle && (
                      <div>
                        <span className="uppercase text-stone text-[10px] block">Instagram:</span>
                        <a href={`https://instagram.com/${app.instagramHandle.replace("@", "")}`} target="_blank" className="font-bold text-charcoal underline">
                          {app.instagramHandle}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Portfolio Image Grid */}
                {app.portfolioImages.length > 0 && (
                  <div>
                    <span className="uppercase text-stone text-[10px] font-bold block mb-2">
                      Portfolio Samples ({app.portfolioImages.length}):
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {app.portfolioImages.map((img, i) => (
                        <a key={i} href={img} target="_blank" className="relative aspect-square rounded-xl overflow-hidden border border-cloud block group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                {app.status === "pending" && (
                  <div className="pt-3 border-t border-cloud flex gap-2">
                    <button
                      type="button"
                      disabled={processingId === app.id}
                      onClick={() => handleAction(app.id, "approve")}
                      className="px-6 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-black disabled:opacity-60"
                    >
                      ✓ Approve Application
                    </button>
                    <button
                      type="button"
                      disabled={processingId === app.id}
                      onClick={() => handleAction(app.id, "more_info")}
                      className="px-5 py-2.5 border border-cloud text-stone font-sans text-xs font-bold uppercase rounded-full hover:bg-mist"
                    >
                      Request Info
                    </button>
                    <button
                      type="button"
                      disabled={processingId === app.id}
                      onClick={() => handleAction(app.id, "reject")}
                      className="px-5 py-2.5 text-red-700 font-sans text-xs font-bold uppercase rounded-full hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
