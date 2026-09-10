"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Star, MessageSquare, Search, Eye, EyeOff, Send, User, ShoppingBag } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  isVerified: boolean;
  isApproved: boolean;
  designerReply?: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
  product: { id: string; name: string; designerName: string };
};

export default function AdminReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "hidden">("all");

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data?.ok) {
        setReviews(data.data.reviews || []);
      }
    } catch {
      /* error */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function handleToggleApprove(id: string, currentApproved: boolean) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentApproved }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !currentApproved } : r))
        );
      }
    } catch {
      /* error */
    }
  }

  async function handlePostReply(id: string) {
    const reply = replyText[id];
    if (!reply?.trim()) return;
    setSubmittingId(id);

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designerReply: reply }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, designerReply: reply } : r))
        );
      }
    } catch {
      /* error */
    } finally {
      setSubmittingId(null);
    }
  }

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        r.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.product.designerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.user.name && r.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.body && r.body.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        filter === "all" ? true : filter === "published" ? r.isApproved : !r.isApproved;

      return matchesSearch && matchesFilter;
    });
  }, [reviews, searchQuery, filter]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Customer Ratings & Feedback"
        subtitle="Moderate buyer reviews, verify verified purchaser stamps, and manage official house replies"
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          label="Total Reviews"
          value={String(reviews.length)}
          icon={<MessageSquare className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="Average Marketplace Rating"
          value={`${avgRating} / 5.0`}
          icon={<Star className="w-4 h-4 text-zinc-900 fill-zinc-900" />}
          badgeBg="bg-zinc-950 text-white"
        />
        <AdminStatCard
          label="Published Feedback"
          value={String(reviews.filter((r) => r.isApproved).length)}
          icon={<Eye className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === "all" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("published")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === "published" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Published ({reviews.filter((r) => r.isApproved).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("hidden")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === "hidden" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Hidden ({reviews.filter((r) => !r.isApproved).length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product, buyer, or text..."
            className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-white rounded-xl border border-zinc-200/80 animate-pulse" />
          <div className="h-32 bg-white rounded-xl border border-zinc-200/80 animate-pulse" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-sm font-semibold text-zinc-950">No customer reviews found</p>
          <p className="text-xs text-zinc-500 mt-1">
            {reviews.length === 0 ? "Customer reviews submitted on orders will appear here." : "No reviews match your search query."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center text-zinc-950">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? "fill-zinc-950 text-zinc-950" : "text-zinc-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-xs text-zinc-950">
                      {r.title || `${r.rating} / 5 Rating`}
                    </span>
                    {r.isVerified && (
                      <span className="text-[10px] font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-1.5">
                    <span>Product:</span>
                    <strong className="text-zinc-900">{r.product.name}</strong>
                    <span>({r.product.designerName})</span>
                    <span>· Buyer:</span>
                    <strong className="text-zinc-900">{r.user.name || r.user.email}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <AdminStatusBadge status={r.isApproved ? "approved" : "draft"} />
                  <button
                    type="button"
                    onClick={() => handleToggleApprove(r.id, r.isApproved)}
                    className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-xs font-medium rounded-lg text-zinc-700 transition-colors shadow-2xs"
                  >
                    {r.isApproved ? "Hide" : "Publish"}
                  </button>
                </div>
              </div>

              {r.body && <p className="text-xs text-zinc-700 leading-relaxed">{r.body}</p>}

              {/* Designer Official Response */}
              {r.designerReply ? (
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/70 text-xs space-y-1">
                  <span className="font-semibold text-[10px] uppercase tracking-wider text-zinc-500 block">
                    Official House Response:
                  </span>
                  <p className="text-zinc-900">{r.designerReply}</p>
                </div>
              ) : (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    value={replyText[r.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                    placeholder="Write official response on behalf of atelier..."
                    className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
                  />
                  <button
                    type="button"
                    disabled={submittingId === r.id}
                    onClick={() => handlePostReply(r.id)}
                    className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Reply</span>
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
