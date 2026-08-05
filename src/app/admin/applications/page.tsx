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
        title="Designer Applications Queue"
        subtitle="Review, curate, and onboard prospective luxury brand applicants"
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-[#ECE8DC]">
        {["pending", "approved", "rejected", "more_info_needed", "all"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition-colors ${
              filter === st
                ? "bg-[#17181D] text-white shadow-xs"
                : "bg-white text-[#8A8A8A] border border-[#ECE8DC] hover:text-[#1A1A1A]"
            }`}
          >
            {st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 bg-white/70 animate-pulse rounded-none border border-[#ECE8DC]" />
          <div className="h-40 bg-white/70 animate-pulse rounded-none border border-[#ECE8DC]" />
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center rounded-none border border-[#ECE8DC] bg-white">
          <p className="text-sm font-bold text-[#1A1A1A]">No applications found in this queue</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-none border border-[#ECE8DC] space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECE8DC] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] bg-[#F6D746] px-2.5 py-0.5 rounded-none inline-block mb-1">
                    {app.brandName}
                  </span>
                  <h2 className="font-display text-lg font-bold text-[#1A1A1A]">
                    {app.applicantName} <span className="text-[#8A8A8A] font-normal text-xs">· {app.applicantCity}</span>
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8A8A8A] font-medium">{app.applicantEmail} · {app.applicantPhone}</span>
                  <AdminStatusBadge status={app.status} />
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#1A1A1A]">
                <p><strong className="uppercase text-[#8A8A8A] text-[10px] block">Founding Story:</strong> {app.brandStory}</p>
                {app.designPhilosophy && (
                  <p><strong className="uppercase text-[#8A8A8A] text-[10px] block">Philosophy:</strong> {app.designPhilosophy}</p>
                )}

                <div className="flex flex-wrap gap-4 pt-1">
                  <div>
                    <span className="uppercase text-[#8A8A8A] text-[10px] block">Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {app.categories.map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-[#F4F0E5] text-[10px] font-bold rounded-none text-[#1A1A1A]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="uppercase text-[#8A8A8A] text-[10px] block">Price Segment:</span>
                    <span className="font-bold text-[#1A1A1A]">{app.priceRange}</span>
                  </div>
                  {app.instagramHandle && (
                    <div>
                      <span className="uppercase text-[#8A8A8A] text-[10px] block">Instagram:</span>
                      <a href={`https://instagram.com/${app.instagramHandle.replace("@", "")}`} target="_blank" rel="noreferrer" className="font-bold text-[#1A1A1A] underline">
                        {app.instagramHandle}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio Image Grid */}
              {app.portfolioImages.length > 0 && (
                <div>
                  <span className="uppercase text-[#8A8A8A] text-[10px] font-bold block mb-2">
                    Portfolio Samples ({app.portfolioImages.length}):
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {app.portfolioImages.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="relative aspect-square rounded-none overflow-hidden border border-[#ECE8DC] block group bg-[#F4F0E5]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {app.status === "pending" && (
                <div className="pt-3 border-t border-[#ECE8DC] flex gap-2">
                  <button
                    type="button"
                    disabled={processingId === app.id}
                    onClick={() => handleAction(app.id, "approve")}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#F6D746] text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider rounded-none shadow-2xs hover:bg-[#F6D746]/90 disabled:opacity-60 cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4 stroke-[2]" />
                    Approve Application
                  </button>
                  <button
                    type="button"
                    disabled={processingId === app.id}
                    onClick={() => handleAction(app.id, "more_info")}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white border border-[#ECE8DC] text-[#1A1A1A] font-sans text-xs font-bold uppercase rounded-none hover:bg-white/80"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Request Info
                  </button>
                  <button
                    type="button"
                    disabled={processingId === app.id}
                    onClick={() => handleAction(app.id, "reject")}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-red-700 font-sans text-xs font-bold uppercase rounded-none hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
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
