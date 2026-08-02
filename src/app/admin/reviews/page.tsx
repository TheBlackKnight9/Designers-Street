"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Verified Customer Reviews Moderation Desk
          </h1>
          <p className="text-xs text-stone mt-1">
            Monitor buyer reviews, verify purchase authenticity, hide inappropriate reviews &amp; publish brand responses
          </p>
        </div>

        <Link
          href="/admin"
          className="px-5 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-black"
        >
          ← Admin Console
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 bg-mist rounded-3xl animate-pulse" />
          <div className="h-28 bg-mist rounded-3xl animate-pulse" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-cloud bg-white">
          <p className="text-sm font-semibold text-charcoal">No customer reviews submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-3xl border border-cloud space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cloud pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold text-sm">{"★".repeat(r.rating)}</span>
                    <span className="font-bold text-xs text-charcoal">{r.product?.name}</span>
                    <span className="text-xs text-stone font-mono">({r.product?.designerName})</span>
                    {r.isVerified && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[9px] font-extrabold uppercase rounded-full">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone mt-0.5">
                    Reviewer: <strong className="text-charcoal">{r.user?.name || r.user?.email}</strong> ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleApprove(r.id, r.isApproved)}
                  className={`px-3.5 py-1.5 font-sans text-xs font-bold uppercase rounded-full shadow-xs ${
                    r.isApproved
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                      : "bg-red-100 text-red-900 border border-red-200"
                  }`}
                >
                  {r.isApproved ? "Approved (Visible)" : "Hidden"}
                </button>
              </div>

              {r.title && <h4 className="font-bold text-xs text-charcoal">{r.title}</h4>}
              <p className="text-xs text-stone leading-relaxed">{r.body}</p>

              {/* Brand Response Section */}
              <div className="pt-2 border-t border-cloud space-y-2">
                {r.designerReply ? (
                  <div className="bg-mist p-3 rounded-2xl border border-cloud text-xs">
                    <span className="font-bold text-charcoal block">Published Brand Response:</span>
                    <p className="text-stone italic mt-0.5">{r.designerReply}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={replyText[r.id] || ""}
                      onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                      placeholder="Write official brand response to buyer..."
                      className="flex-1 rounded-xl border border-cloud bg-mist p-2.5 text-xs outline-none"
                    />
                    <button
                      type="button"
                      disabled={submittingId === r.id}
                      onClick={() => handlePostReply(r.id)}
                      className="px-4 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase rounded-full shadow-xs hover:bg-black disabled:opacity-60"
                    >
                      Publish Response
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
