"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/dashboard/Toast";

const BUSINESS_TYPES = ["Proprietorship", "LLP", "Pvt Ltd", "Individual / Artisan"];

export default function DesignerVerificationPage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [razorpayStatus, setRazorpayStatus] = useState<string | null>(null);
  const [listingsApproved, setListingsApproved] = useState(false);

  const [form, setForm] = useState({
    businessType: "Proprietorship",
    gstin: "",
    panNumber: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfsc: "",
    cancelledChequeUrl: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingPincode: "",
  });

  useEffect(() => {
    fetch("/api/dashboard/verification")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setRazorpayStatus(data.data.razorpayAccountStatus);
          setListingsApproved(data.data.listingsApproved);
          if (data.data.verification) {
            const v = data.data.verification;
            setForm({
              businessType: v.businessType || "Proprietorship",
              gstin: v.gstin || "",
              panNumber: v.panNumber || "",
              bankAccountName: v.bankAccountName || "",
              bankAccountNumber: v.bankAccountNumber || "",
              bankIfsc: v.bankIfsc || "",
              cancelledChequeUrl: v.cancelledChequeUrl || "",
              shippingAddress: v.shippingAddress || "",
              shippingCity: v.shippingCity || "",
              shippingState: v.shippingState || "",
              shippingPincode: v.shippingPincode || "",
            });
          }
        }
      })
      .catch(() => push("Failed to load verification status", "err"))
      .finally(() => setLoading(false));
  }, [push]);

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("folder", "designer-kyc");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && (data?.data?.secureUrl || data?.url)) {
        setForm((f) => ({ ...f, cancelledChequeUrl: data?.data?.secureUrl || data?.url }));
        push("Cancelled cheque uploaded", "ok");
      } else {
        push("Upload failed", "err");
      }
    } catch {
      push("Upload failed", "err");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data?.ok) {
        setRazorpayStatus(data.data.razorpayAccountStatus);
        push("KYC & Bank details saved successfully!", "ok");
      } else {
        push(data?.error?.message || "Failed to save verification", "err");
      }
    } catch {
      push("Verification save error", "err");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-96 rounded-2xl bg-mist animate-pulse" />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Seller KYC &amp; Payout Verification
          </h1>
          <p className="text-xs text-stone mt-1">
            Verify GSTIN, PAN, and Bank details for automated Razorpay Route payout settlements
          </p>
        </div>

        <div className="text-right">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              razorpayStatus === "activated"
                ? "bg-emerald-100 text-emerald-800"
                : razorpayStatus === "manual_transfer_pending"
                ? "bg-amber-100 text-amber-900"
                : "bg-cloud text-stone"
            }`}
          >
            {razorpayStatus === "activated"
              ? "✓ Razorpay Active"
              : razorpayStatus === "manual_transfer_pending"
              ? "⚠️ Manual NEFT Payout"
              : "Pending Verification"}
          </span>
          <p className="text-[10px] text-stone mt-1">
            Listing QC Status: {listingsApproved ? "✓ Approved" : "Pending QC"}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-cloud space-y-6 shadow-xs">
        {/* Business Info */}
        <div className="space-y-4">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal pb-2 border-b border-cloud">
            1. Business Tax Registration
          </h2>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone block mb-1">
              Entity Type *
            </span>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setForm({ ...form, businessType: bt })}
                  className={`px-4 py-2 text-xs font-bold uppercase rounded-xl border transition-colors ${
                    form.businessType === bt
                      ? "bg-charcoal text-paper border-charcoal"
                      : "bg-mist text-stone border-cloud"
                  }`}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                PAN Number (10 Characters) *
              </span>
              <input
                required
                maxLength={10}
                value={form.panNumber}
                onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                placeholder="ABCDE1234F"
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs font-mono font-bold tracking-wider outline-none focus:ring-2 focus:ring-gold/40"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                GSTIN (15 Characters - Optional if exempt)
              </span>
              <input
                maxLength={15}
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                placeholder="22AAAAA0000A1Z5"
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs font-mono font-bold tracking-wider outline-none focus:ring-2 focus:ring-gold/40"
              />
            </label>
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-4 pt-2">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal pb-2 border-b border-cloud">
            2. Payout Bank Account Details
          </h2>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Account Beneficiary Name *
            </span>
            <input
              required
              value={form.bankAccountName}
              onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
              placeholder="As printed on bank passbook/cheque"
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                Bank Account Number *
              </span>
              <input
                required
                value={form.bankAccountNumber}
                onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                placeholder="91801002345678"
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-gold/40"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                Bank IFSC Code (11 Chars) *
              </span>
              <input
                required
                maxLength={11}
                value={form.bankIfsc}
                onChange={(e) => setForm({ ...form, bankIfsc: e.target.value.toUpperCase() })}
                placeholder="HDFC0001234"
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs font-mono font-bold tracking-wider outline-none focus:ring-2 focus:ring-gold/40"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Upload Cancelled Cheque / Bank Statement
            </span>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="cheque-upload"
              />
              <label
                htmlFor="cheque-upload"
                className="px-4 py-2.5 bg-mist border border-cloud rounded-xl text-xs font-bold uppercase text-charcoal hover:bg-cloud cursor-pointer"
              >
                {uploading ? "Uploading…" : "Choose Document File"}
              </label>
              {form.cancelledChequeUrl && (
                <span className="text-xs text-emerald-800 font-bold">✓ Document Attached</span>
              )}
            </div>
          </label>
        </div>

        {/* Shipping Origin Address */}
        <div className="space-y-4 pt-2">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal pb-2 border-b border-cloud">
            3. Order Dispatch &amp; Shipping Origin Address
          </h2>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Studio / Dispatch Address Line 1 *
            </span>
            <input
              required
              value={form.shippingAddress}
              onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
              placeholder="Building No, Workshop Area, Street"
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>

          <div className="grid grid-cols-3 gap-2">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                City *
              </span>
              <input
                required
                value={form.shippingCity}
                onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                placeholder="City"
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                State *
              </span>
              <input
                required
                value={form.shippingState}
                onChange={(e) => setForm({ ...form, shippingState: e.target.value })}
                placeholder="State"
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                Pincode *
              </span>
              <input
                required
                maxLength={6}
                value={form.shippingPincode}
                onChange={(e) => setForm({ ...form, shippingPincode: e.target.value })}
                placeholder="110001"
                className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-gold/40"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-cloud flex items-center justify-between">
          <Link
            href="/seller-terms"
            target="_blank"
            className="text-xs text-stone hover:text-charcoal underline"
          >
            Review Seller Terms &amp; Commission Agreement
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md disabled:opacity-60"
          >
            {saving ? "Submitting KYC…" : "Save & Verify Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
