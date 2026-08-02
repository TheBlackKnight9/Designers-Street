"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  images: string[];
  isVerified: boolean;
  designerReply?: string | null;
  createdAt: string;
  user: { name: string | null; avatarUrl?: string | null };
};

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(5.0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data?.ok) {
        setReviews(data.data.reviews || []);
        setAvgRating(data.data.avgRating || 5.0);
        setTotalCount(data.data.totalCount || 0);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title,
          body,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        setShowModal(false);
        setTitle("");
        setBody("");
        fetchReviews();
      } else {
        setError(data?.error?.message || "Failed to submit review");
      }
    } catch {
      setError("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-cloud space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cloud pb-4">
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-charcoal">
            Verified Buyer Reviews
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-amber-500 text-lg font-bold">★ {avgRating.toFixed(1)}</span>
            <span className="text-xs text-stone font-medium">({totalCount} verified buyer reviews)</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-black"
        >
          ✍️ Write a Review
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 bg-mist rounded-2xl animate-pulse" />
          <div className="h-20 bg-mist rounded-2xl animate-pulse" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-8 text-center text-xs text-stone">
          No reviews yet. Be the first verified buyer to leave a review!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-mist/30 border border-cloud space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold text-sm">{"★".repeat(rev.rating)}</span>
                  {rev.isVerified && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[9px] font-extrabold uppercase rounded-full">
                      ✓ Verified Buyer
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone font-mono">
                  {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              {rev.title && <h4 className="font-bold text-xs text-charcoal">{rev.title}</h4>}
              <p className="text-xs text-stone leading-relaxed">{rev.body}</p>

              {rev.designerReply && (
                <div className="mt-2 bg-white p-3 rounded-xl border border-cloud text-xs space-y-1">
                  <span className="font-bold text-charcoal block">Designer Atelier Response:</span>
                  <p className="text-stone italic">{rev.designerReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-cloud pb-3">
              <h3 className="font-display text-base font-bold uppercase text-charcoal">
                Write a Verified Buyer Review
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs font-bold text-stone hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Rating *</span>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform ${star <= rating ? "text-amber-500 scale-110" : "text-cloud"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Review Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Exquisite Silk Craftsmanship & Fit"
                  className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Review Details *</span>
                <textarea
                  required
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share details about the fabric, tailoring, and fit..."
                  className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs outline-none resize-none"
                />
              </label>

              {error && <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl font-medium">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-black disabled:opacity-60"
              >
                {submitting ? "Submitting Review…" : "Submit Review →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
