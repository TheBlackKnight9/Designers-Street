"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";

type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed_amount";
  value: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function AdminCouponsPage() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed_amount">("fixed_amount");
  const [value, setValue] = useState(1000); // ₹1,000 or 10%
  const [minOrderValue, setMinOrderValue] = useState(10000); // ₹10,000
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchCoupons() {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data?.ok) {
        setCoupons(data.data.coupons || []);
      }
    } catch {
      /* error */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          type,
          value,
          minOrderValue,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          expiresAt: expiresAt || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        alert(`Coupon ${code} created successfully!`);
        setShowModal(false);
        setCode("");
        fetchCoupons();
      } else {
        alert(data?.error?.message || "Failed to create coupon");
      }
    } catch {
      alert("Error creating coupon");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Promotional Coupon &amp; Discount Manager
          </h1>
          <p className="text-xs text-stone mt-1">
            Create percentage &amp; fixed-amount promo codes with cart subtotal minimums, usage caps &amp; expiry dates
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin"
            className="px-4 py-2.5 bg-white text-stone border border-cloud font-sans text-xs font-bold uppercase rounded-full shadow-xs hover:bg-mist"
          >
            ← Admin Console
          </Link>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-black"
          >
            + Create New Coupon
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 bg-mist rounded-3xl animate-pulse" />
          <div className="h-28 bg-mist rounded-3xl animate-pulse" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-cloud bg-white">
          <p className="text-sm font-semibold text-charcoal">🎟️ No promotional coupons created yet.</p>
          <p className="text-xs text-stone mt-1">Click &quot;Create New Coupon&quot; to add discount codes for festive campaigns.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cloud shadow-xs overflow-hidden">
          <div className="p-5 border-b border-cloud flex justify-between items-center">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">Active &amp; Expired Promo Codes</h2>
            <span className="text-xs font-mono font-bold text-stone">Total Codes: {coupons.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-mist text-[10px] font-bold uppercase tracking-wider text-stone border-b border-cloud">
                <tr>
                  <th className="p-3.5">Promo Code</th>
                  <th className="p-3.5">Discount Type</th>
                  <th className="p-3.5">Value</th>
                  <th className="p-3.5">Min Order Value</th>
                  <th className="p-3.5">Usage Count / Limit</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud text-charcoal">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-mist/30">
                    <td className="p-3.5 font-mono font-extrabold text-charcoal text-sm">{c.code}</td>
                    <td className="p-3.5 uppercase font-mono text-[10px]">{c.type}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-800">
                      {c.type === "percentage" ? `${c.value}% OFF` : formatPrice(c.value / 100)}
                    </td>
                    <td className="p-3.5 font-mono">{formatPrice(c.minOrderValue / 100)}</td>
                    <td className="p-3.5 font-mono">
                      {c.usedCount} / {c.usageLimit ?? "∞"}
                    </td>
                    <td className="p-3.5 font-mono text-stone">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                    </td>
                    <td className="p-3.5 text-right">
                      <span
                        className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-full ${
                          c.isActive ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
                        }`}
                      >
                        {c.isActive ? "Active" : "Expired / Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-cloud pb-3">
              <h3 className="font-display text-base font-bold uppercase text-charcoal">Create Promotional Coupon</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-xs font-bold text-stone hover:text-charcoal">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Promo Code *</span>
                <input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE1000 or WELCOME10"
                  className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs font-mono font-bold uppercase outline-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Type *</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs font-medium outline-none"
                  >
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                    {type === "percentage" ? "Percentage (%) *" : "Discount Amount (₹) *"}
                  </span>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs font-mono font-bold outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Min Order (₹)</span>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs font-mono outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Max Discount (₹)</span>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="Optional cap"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs font-mono outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Usage Limit</span>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Unlimited"
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Expiry Date</span>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist p-3 text-xs outline-none"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-black disabled:opacity-60"
              >
                {submitting ? "Creating Coupon..." : "Publish Promo Coupon →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
