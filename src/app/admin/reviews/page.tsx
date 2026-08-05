"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Star, MessageSquare } from "lucide-react";

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

  async function fetchReviews() {
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

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Customer Reviews Moderation"
        subtitle="Monitor buyer reviews, verify purchase authenticity, hide policy violations & publish responses"
      />

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 bg-white/70 rounded-2xl animate-pulse border border-[#ECE8DC]" />
          <div className="h-28 bg-white/70 rounded-2xl animate-pulse border border-[#ECE8DC]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[#ECE8DC] bg-white">
          <p className="text-sm font-bold text-[#1A1A1A]">No customer reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-2xl border border-[#ECE8DC] space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECE8DC] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-[#ECE8DC]"}`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-xs text-[#1A1A1A]">{r.title || `${r.rating} / 5 Stars`}</span>
                  </div>
                  <p className="text-xs text-[#8A8A8A] mt-1 font-medium">
                    Product: <strong className="text-[#1A1A1A]">{r.product.name}</strong> ({r.product.designerName}) · Buyer:{" "}
                    <strong className="text-[#1A1A1A]">{r.user.name || r.user.email}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <AdminStatusBadge status={r.isApproved ? "approved" : "pending"} />
                  <button
                    type="button"
                    onClick={() => handleToggleApprove(r.id, r.isApproved)}
                    className="px-3 py-1.5 border border-[#ECE8DC] text-xs font-bold uppercase rounded-full text-[#8A8A8A] hover:bg-[#F4F0E5] hover:text-[#1A1A1A] transition-colors"
                  >
                    {r.isApproved ? "Hide Review" : "Publish Review"}
                  </button>
                </div>
              </div>

              {r.body && <p className="text-xs text-[#1A1A1A]">{r.body}</p>}

              {/* Designer Official Response */}
              {r.designerReply ? (
                <div className="bg-[#F4F0E5]/60 p-3 rounded-xl border border-[#ECE8DC] text-xs space-y-1">
                  <span className="font-bold uppercase text-[10px] text-[#8A8A8A] block">
                    Official Atelier Response:
                  </span>
                  <p className="text-[#1A1A1A]">{r.designerReply}</p>
                </div>
              ) : (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    value={replyText[r.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                    placeholder="Write official response on behalf of designer house…"
                    className="flex-1 rounded-xl border border-[#ECE8DC] bg-[#F4F0E5] p-2.5 text-xs outline-none font-medium"
                  />
                  <button
                    type="button"
                    disabled={submittingId === r.id}
                    onClick={() => handlePostReply(r.id)}
                    className="px-4 py-2.5 bg-[#F6D746] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-full shadow-2xs hover:bg-[#F6D746]/90 disabled:opacity-60 cursor-pointer"
                  >
                    Reply
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
