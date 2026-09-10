"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Check, X, HelpCircle, ExternalLink } from "lucide-react";

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
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Designer Applications"
        subtitle="Review, curate, and onboard prospective luxury brand applicants"
      />

      {/* Filter Tabs */}
      <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 w-fit flex-wrap">
        {["pending", "approved", "rejected", "more_info_needed", "all"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={`px-3.5 py-1 text-xs font-medium capitalize rounded-md transition-all ${
              filter === st
                ? "bg-white text-zinc-950 shadow-xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 bg-white animate-pulse rounded-xl border border-zinc-200" />
          <div className="h-40 bg-white animate-pulse rounded-xl border border-zinc-200" />
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-zinc-200 bg-white">
          <p className="text-sm font-semibold text-zinc-950">No applications in this queue</p>
          <p className="text-xs text-zinc-500 mt-1">New designer submissions will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-xl border border-zinc-200/90 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3.5">
                <div>
                  <span className="text-xs font-semibold text-zinc-900 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-md inline-block mb-1.5">
                    {app.brandName}
                  </span>
                  <h2 className="text-base font-semibold text-zinc-950">
                    {app.applicantName} <span className="text-zinc-400 font-normal text-xs">· {app.applicantCity}</span>
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-zinc-500 font-normal">{app.applicantEmail} · {app.applicantPhone}</span>
                  <AdminStatusBadge status={app.status} />
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-800 leading-relaxed">
                <p><strong className="text-zinc-500 text-[11px] uppercase tracking-wider block font-semibold">Founding Story:</strong> {app.brandStory}</p>
                {app.designPhilosophy && (
                  <p><strong className="text-zinc-500 text-[11px] uppercase tracking-wider block font-semibold">Design Philosophy:</strong> {app.designPhilosophy}</p>
                )}

                <div className="flex flex-wrap gap-4 pt-1">
                  <div>
                    <span className="text-zinc-500 text-[11px] uppercase tracking-wider block font-semibold">Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {app.categories.map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-[11px] font-medium rounded-md text-zinc-800">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[11px] uppercase tracking-wider block font-semibold">Price Segment:</span>
                    <span className="font-semibold text-zinc-950 mt-1 block">{app.priceRange}</span>
                  </div>
                  {app.instagramHandle && (
                    <div>
                      <span className="text-zinc-500 text-[11px] uppercase tracking-wider block font-semibold">Instagram:</span>
                      <a href={`https://instagram.com/${app.instagramHandle.replace("@", "")}`} target="_blank" rel="noreferrer" className="font-medium text-zinc-950 underline mt-1 block hover:text-zinc-700">
                        {app.instagramHandle}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio Image Grid */}
              {app.portfolioImages.length > 0 && (
                <div className="pt-1">
                  <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold block mb-2">
                    Portfolio Samples ({app.portfolioImages.length}):
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {app.portfolioImages.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 block group bg-zinc-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {app.status === "pending" && (
                <div className="pt-3 border-t border-zinc-100 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={processingId === app.id}
                    onClick={() => handleAction(app.id, "approve")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white text-xs font-medium rounded-lg shadow-xs hover:bg-zinc-800 disabled:opacity-60 cursor-pointer active:scale-[0.98] transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve Application
                  </button>
                  <button
                    type="button"
                    disabled={processingId === app.id}
                    onClick={() => handleAction(app.id, "more_info")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Request Info
                  </button>
                  <button
                    type="button"
                    disabled={processingId === app.id}
                    onClick={() => handleAction(app.id, "reject")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
