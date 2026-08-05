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
        title="Promotional Coupons & Discounts"
        subtitle="Create percentage & fixed-amount promo codes with cart minimums, usage caps & expiry dates"
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
            <div key={i} className="h-16 rounded-none bg-white/70 animate-pulse border border-[#ECE8DC]" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 text-center rounded-none border border-[#ECE8DC] bg-white">
          <p className="text-sm font-bold text-[#1A1A1A]">No promotional coupons active</p>
        </div>
      ) : (
        <div className="bg-white rounded-none border border-[#ECE8DC] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECE8DC] text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] bg-[#FAF8F5]">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Type</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Min Order</th>
                  <th className="py-3 px-4">Usage (Used/Limit)</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8DC]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#1A1A1A]">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#F6D746] fill-[#F6D746]" />
                        <span className="bg-[#F4F0E5] px-2.5 py-1 rounded-none border border-[#ECE8DC]">
                          {c.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-[#1A1A1A] capitalize">
                      {c.type.replace("_", " ")}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-700">
                      {c.type === "fixed_amount" ? formatPrice(c.value) : `${c.value}% OFF`}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#1A1A1A]">
                      {formatPrice(c.minOrderValue)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#8A8A8A]">
                      {c.usedCount} / {c.usageLimit ? c.usageLimit : "∞"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#8A8A8A] font-medium">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                    </td>
                    <td className="py-3.5 px-4">
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
          <div className="bg-white rounded-none p-6 max-w-md w-full space-y-4 shadow-xl border border-[#ECE8DC]">
            <div className="flex justify-between items-center border-b border-[#ECE8DC] pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A8A] block">
                  Promotions Engine
                </span>
                <h3 className="font-display text-base font-bold uppercase text-[#1A1A1A]">
                  Create Promo Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-none bg-[#F4F0E5] text-[#1A1A1A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs font-sans">
              <label className="block">
                <span className="font-bold uppercase text-[#8A8A8A]">Coupon Code *</span>
                <input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="e.g. WELCOME15"
                  className="mt-1 w-full rounded-none border border-[#ECE8DC] bg-[#F4F0E5] p-3 text-xs font-mono font-bold outline-none tracking-wider"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-bold uppercase text-[#8A8A8A]">Discount Type</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-none border border-[#ECE8DC] bg-[#F4F0E5] p-3 text-xs font-bold outline-none"
                  >
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="font-bold uppercase text-[#8A8A8A]">Value *</span>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="mt-1 w-full rounded-none border border-[#ECE8DC] bg-[#F4F0E5] p-3 text-xs font-mono font-bold outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-bold uppercase text-[#8A8A8A]">Min Cart Subtotal (₹)</span>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="mt-1 w-full rounded-none border border-[#ECE8DC] bg-[#F4F0E5] p-3 text-xs font-mono font-bold outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#F6D746] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-none shadow-md hover:bg-[#F6D746]/90 disabled:opacity-60 cursor-pointer"
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
