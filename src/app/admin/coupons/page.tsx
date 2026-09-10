"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Plus, X, Tag } from "lucide-react";

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
  const [value, setValue] = useState(1000);
  const [minOrderValue, setMinOrderValue] = useState(10000);
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
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Promotions & Coupons"
        subtitle="Manage discount codes, percentage vouchers, minimum cart thresholds & expiration rules"
        actionButton={{
          label: "New Coupon",
          href: "",
          onClick: () => setShowModal(true),
        }}
      />

      {/* Coupons Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white animate-pulse border border-zinc-200" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-zinc-200 bg-white">
          <p className="text-sm font-semibold text-zinc-950">No promotional coupons active</p>
          <p className="text-xs text-zinc-500 mt-1">Click '+ New Coupon' to create your first discount code.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-50/60">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Type</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Min Order</th>
                  <th className="py-3 px-4">Usage (Used/Limit)</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 font-mono text-xs font-semibold text-zinc-950">
                          {c.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-zinc-800 capitalize">
                      {c.type.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-zinc-950">
                      {c.type === "fixed_amount" ? formatPrice(c.value) : `${c.value}% OFF`}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-medium text-zinc-600">
                      {formatPrice(c.minOrderValue)}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-500">
                      {c.usedCount} / {c.usageLimit ? c.usageLimit : "∞"}
                    </td>
                    <td className="py-3 px-4 text-xs text-zinc-500 font-medium">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                    </td>
                    <td className="py-3 px-4">
                      <AdminStatusBadge status={c.isActive ? "active" : "inactive"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl border border-zinc-200">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                  Promotions Engine
                </span>
                <h3 className="text-base font-semibold text-zinc-950">
                  Create Promo Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs font-sans">
              <label className="block">
                <span className="text-[11px] font-medium text-zinc-700">Coupon Code *</span>
                <input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="e.g. WELCOME15"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs font-mono font-semibold text-zinc-900 outline-none focus:border-zinc-900 shadow-2xs tracking-wider uppercase"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[11px] font-medium text-zinc-700">Discount Type</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs font-medium text-zinc-900 outline-none focus:border-zinc-900 shadow-2xs"
                  >
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-[11px] font-medium text-zinc-700">Value *</span>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs font-mono font-medium text-zinc-900 outline-none focus:border-zinc-900 shadow-2xs"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[11px] font-medium text-zinc-700">Min Cart Subtotal (₹)</span>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs font-mono font-medium text-zinc-900 outline-none focus:border-zinc-900 shadow-2xs"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-zinc-950 text-white text-xs font-medium rounded-lg shadow-xs hover:bg-zinc-800 disabled:opacity-60 cursor-pointer transition-colors"
              >
                {submitting ? "Creating Promo…" : "Create Coupon Code →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
