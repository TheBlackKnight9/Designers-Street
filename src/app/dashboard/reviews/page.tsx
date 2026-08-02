"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DesignerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  async function fetchDesignerReviews() {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (data?.ok && Array.isArray(data.data?.reviews)) {
        setReviews(data.data.reviews);
      }
    } catch {
      /* error */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDesignerReviews();
  }, []);

  return (
    <main className="min-h-screen bg-paper pb-24 px-4 pt-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cloud pb-4">
        <div>
          <Link href="/dashboard" className="text-xs font-bold text-stone hover:text-charcoal">
            ← Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal mt-1">
            Customer Reviews &amp; Feedback
          </h1>
          <p className="text-xs text-stone mt-0.5">
            Monitor verified buyer reviews for your garments and post official brand responses
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone animate-pulse font-bold">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-cloud text-center text-xs text-stone">
          No customer reviews submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-3xl border border-cloud space-y-3 shadow-xs">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-xs text-charcoal">{r.user?.name || "Customer"}</span>
                  <span className="ml-2 text-amber-500 font-bold text-xs">{"★".repeat(r.rating)}</span>
                </div>
                <span className="text-[10px] font-mono text-stone">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>

              {r.title && <h3 className="font-bold text-xs text-charcoal">{r.title}</h3>}
              {r.body && <p className="text-xs text-stone leading-relaxed">{r.body}</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
