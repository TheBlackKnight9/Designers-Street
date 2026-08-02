"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/mock-data";
import {
  getIndianStates,
  getCitiesForState,
  lookupByPincode,
} from "@/lib/data/india-locations";

type Address = {
  id: string;
  fullName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, itemCount, clearCart, refreshCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [useNew, setUseNew] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmountRupees: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"address" | "review">("address");

  const indianStates = getIndianStates();
  const cityOptions = form.state ? getCitiesForState(form.state) : [];

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok && Array.isArray(body.data?.addresses)) {
          setAddresses(body.data.addresses);
          const def =
            body.data.addresses.find((a: Address) => a.isDefault) ||
            body.data.addresses[0];
          if (def) {
            setAddressId(def.id);
          }
          if (body.data.addresses.length === 0) setUseNew(true);
        } else {
          setUseNew(true);
        }
      })
      .catch(() => setUseNew(true));
  }, []);

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError(null);
    setValidatingCoupon(true);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartSubtotal: total,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ok && data.data?.valid) {
        setAppliedCoupon({
          code: data.data.coupon.code,
          discountAmountRupees: data.data.coupon.discountAmountRupees,
        });
        setCouponCode("");
      } else {
        setCouponError(data?.error?.message || "Invalid promo coupon code");
      }
    } catch {
      setCouponError("Error validating coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  }

  // PIN Code Auto-Fill with offline lookup & online fallback
  async function handlePostalCodeChange(code: string) {
    const clean = code.replace(/\D/g, "").slice(0, 6);
    setForm((f) => ({ ...f, postalCode: clean }));

    const localResult = lookupByPincode(clean);
    if (localResult) {
      setForm((f) => ({
        ...f,
        city: f.city || localResult.city,
        state: f.state || localResult.state,
      }));
    }

    if (clean.length === 6) {
      setPinLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        const data = await res.json();
        if (
          Array.isArray(data) &&
          data[0]?.Status === "Success" &&
          data[0]?.PostOffice?.length > 0
        ) {
          const po = data[0].PostOffice[0];
          setForm((f) => ({
            ...f,
            city: po.District || po.Name || f.city,
            state: po.State || f.state,
          }));
        }
      } catch {
        /* fallback manual entry */
      } finally {
        setPinLoading(false);
      }
    }
  }

  if (itemCount === 0) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen px-4 py-20 text-center bg-paper">
          <h1 className="font-display text-2xl text-charcoal mb-2 uppercase font-bold">Checkout</h1>
          <p className="text-sm text-stone mb-6">Your shopping bag is empty.</p>
          <Link
            href="/store"
            className="inline-flex px-6 py-3 bg-charcoal text-paper text-xs uppercase tracking-wider font-bold rounded-full"
          >
            Explore Designer Stores
          </Link>
        </main>
      </>
    );
  }

  const couponDiscountRupees = appliedCoupon ? appliedCoupon.discountAmountRupees : 0;
  const finalPrepaidTotalRupees = Math.max(0, total - couponDiscountRupees - 100);

  async function onPlaceOrder(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const selectedAddr = addresses.find((a) => a.id === addressId);
    const pincode = useNew ? form.postalCode : selectedAddr?.postalCode || "110001";
    const shippingAddressPayload = useNew
      ? form
      : selectedAddr
      ? {
          fullName: selectedAddr.fullName,
          phone: selectedAddr.phone,
          line1: selectedAddr.line1,
          line2: selectedAddr.line2,
          city: selectedAddr.city,
          state: selectedAddr.state,
          postalCode: selectedAddr.postalCode,
          country: selectedAddr.country,
        }
      : null;

    try {
      // 1. Call Checkout Creation API
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode,
          items,
          shippingAddress: shippingAddressPayload,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error?.message || "Order creation failed. Please try again.");
      }

      const { razorpayOrderId, keyId, amount, isMockPayment } = data.data;

      // ── MOCK PAYMENT PATH (no real Razorpay keys set) ──────────────────
      if (isMockPayment) {
        await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpayOrderId: razorpayOrderId,
            razorpaySignature: "",
          }),
        });
        await clearCart();
        await refreshCart();
        router.replace(`/orders/confirmation?razorpay_payment_id=pay_mock_${Date.now()}`);
        return;
      }

      // ── REAL RAZORPAY PATH (test OR live key) ─────────────────────────
      // 2. Load Razorpay SDK Script dynamically
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: "INR",
        name: "Designer's Street",
        description: `Curated Luxury Order${appliedCoupon ? ` · ${appliedCoupon.code}` : ""} · ₹100 Prepaid Discount Applied`,
        image: "/logo.png",
        order_id: razorpayOrderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData?.ok) {
              setError("Payment verification failed. Please contact support with your payment ID: " + response.razorpay_payment_id);
              setLoading(false);
              return;
            }

            await clearCart();
            await refreshCart();
            router.replace(`/orders/confirmation?razorpay_payment_id=${response.razorpay_payment_id}`);
          } catch {
            setError("Payment received but verification failed. Please save your Payment ID: " + response.razorpay_payment_id);
            setLoading(false);
          }
        },
        prefill: {
          name: useNew ? form.fullName : selectedAddr?.fullName || "",
          contact: useNew ? form.phone : selectedAddr?.phone || "",
        },
        // No method filtering — Razorpay shows all enabled methods from the dashboard
        // (UPI, Cards, Netbanking, Wallet, Pay Later) automatically
        theme: {
          color: "#101010",
          hide_topbar: false,
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError("Payment was cancelled. Your cart is still saved.");
          },
          animation: true,
          backdropclose: false,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setLoading(false);
        setError(`Payment failed: ${response.error?.description || "Unknown error"}. Code: ${response.error?.code || ""}`);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout error. Please try again.");
      setLoading(false);
    }
  }

  // Group items by designer brand
  const groupedItems: Record<string, typeof items> = {};
  items.forEach((item) => {
    const brand = item.brand || "Atelier House";
    if (!groupedItems[brand]) groupedItems[brand] = [];
    groupedItems[brand].push(item);
  });

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-28 max-w-3xl mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-charcoal uppercase tracking-wide">
            Checkout
          </h1>
          <p className="font-sans text-xs text-stone mt-1">
            {step === "address" ? "Step 1 of 2: Delivery Address" : "Step 2 of 2: Order Summary & Payment"}
          </p>
        </div>

        {/* Prepaid Instant Discount Banner */}
        <div className="mb-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-wider text-emerald-200">
                Instant ₹100 Online Payment Discount
              </p>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                Extra ₹100 deducted automatically for UPI, Card &amp; Net Banking payments!
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white text-emerald-900 text-xs font-extrabold rounded-full font-mono shrink-0">
            -₹100 OFF
          </span>
        </div>

        {step === "address" ? (
          <div className="space-y-4">
            {addresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-stone font-bold">
                  Saved Address Book
                </p>
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
                      !useNew && addressId === a.id
                        ? "border-charcoal bg-white shadow-xs"
                        : "border-cloud bg-mist/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={!useNew && addressId === a.id}
                      onChange={() => {
                        setUseNew(false);
                        setAddressId(a.id);
                      }}
                      className="mt-1 accent-charcoal"
                    />
                    <span className="text-xs text-charcoal">
                      <span className="font-bold block text-sm">{a.fullName}</span>
                      {a.line1}{a.line2 ? `, ${a.line2}` : ""}
                      <br />
                      {a.city}, {a.state} - <strong className="font-mono font-bold">{a.postalCode}</strong>
                    </span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setUseNew(true)}
                  className="text-xs uppercase tracking-wider underline text-stone font-bold pt-1 block"
                >
                  + Add New Delivery Address
                </button>
              </div>
            )}

            {useNew && (
              <div className="bg-white p-6 rounded-3xl border border-cloud space-y-3 shadow-xs">
                <h2 className="font-display text-sm font-bold uppercase text-charcoal pb-2 border-b border-cloud">
                  New Delivery Address (India 36 States &amp; UTs)
                </h2>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Full Name *</span>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Phone Number *</span>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                      PIN Code * {pinLoading && "⏳"}
                    </span>
                    <input
                      required
                      maxLength={6}
                      value={form.postalCode}
                      onChange={(e) => handlePostalCodeChange(e.target.value)}
                      placeholder="110001"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs font-mono font-bold outline-none"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Address Line 1 *</span>
                  <input
                    required
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">State *</span>
                    <select
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value, city: "" })}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none font-medium"
                    >
                      <option value="">Select State / UT</option>
                      {indianStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">City / District *</span>
                    {cityOptions.length > 0 ? (
                      <select
                        required
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none font-medium"
                      >
                        <option value="">Select City / District</option>
                        {cityOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        required
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="City"
                        className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none"
                      />
                    )}
                  </label>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (useNew) {
                  if (!form.fullName.trim() || !form.line1.trim() || !form.city.trim() || !form.state.trim() || !form.postalCode.trim()) {
                    return setError("Please complete all required delivery address fields");
                  }
                } else if (!addressId) {
                  return setError("Select a delivery address to proceed");
                }
                setError(null);
                setStep("review");
              }}
              className="w-full py-3.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-black"
            >
              Continue to Order Summary →
            </button>
            {error && <p className="text-xs text-red-700 bg-red-50 rounded-xl p-3 font-medium">{error}</p>}
          </div>
        ) : (
          <form onSubmit={onPlaceOrder} className="space-y-6">
            {/* Multi-Vendor Designer Grouping */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone block">
                Order Items (Grouped by Designer House)
              </span>

              {Object.entries(groupedItems).map(([brand, brandItems]) => (
                <div key={brand} className="bg-white p-5 rounded-3xl border border-cloud space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-cloud pb-2">
                    <span className="font-display text-sm font-bold uppercase text-charcoal">{brand}</span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[9px] uppercase rounded-full tracking-wider">
                      ✓ FREE SHIPPING
                    </span>
                  </div>

                  <div className="space-y-2">
                    {brandItems.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                        <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-mist border border-cloud shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-charcoal truncate">{item.name}</p>
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[8px] font-extrabold rounded uppercase">
                              FREE SHIPPING
                            </span>
                          </div>
                          <p className="text-[10px] text-stone">Size: {item.size} · Qty: {item.quantity}</p>
                          <p className="text-xs font-mono font-bold text-charcoal mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Coupon Code Section */}
            <div className="bg-white p-5 rounded-3xl border border-cloud space-y-3 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                Have a Promo Code?
              </span>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs">
                  <div>
                    <span className="font-mono font-bold text-emerald-950">{appliedCoupon.code}</span>
                    <span className="text-emerald-700 ml-2">(-{formatPrice(appliedCoupon.discountAmountRupees)} OFF)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="text-[10px] font-bold uppercase text-stone hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (e.g. FESTIVE1000)"
                    className="flex-1 rounded-full border border-cloud bg-mist px-4 py-2.5 text-xs font-mono font-bold outline-none uppercase"
                  />
                  <button
                    type="button"
                    disabled={validatingCoupon}
                    onClick={handleApplyCoupon}
                    className="px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase rounded-full shadow-xs hover:bg-black disabled:opacity-60"
                  >
                    {validatingCoupon ? "Checking..." : "Apply Code"}
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl font-medium">{couponError}</p>}
            </div>

            {/* Financial Summary & Stacked Discount Calculation */}
            <div className="bg-white p-6 rounded-3xl border border-cloud space-y-3 shadow-xs">
              <h2 className="font-display text-sm font-bold uppercase text-charcoal pb-2 border-b border-cloud">
                Payment Breakdown &amp; Discounts
              </h2>

              <div className="flex justify-between text-xs text-stone">
                <span>Product Cart Subtotal</span>
                <span className="font-mono font-bold text-charcoal">{formatPrice(total)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-xs text-emerald-700 font-bold">
                  <span>🎟️ Promo Coupon ({appliedCoupon.code})</span>
                  <span className="font-mono font-extrabold text-emerald-700">-{formatPrice(appliedCoupon.discountAmountRupees)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-emerald-700 font-bold">
                <span>✨ Instant Online Prepaid Discount</span>
                <span className="font-mono font-extrabold text-emerald-700">-₹100</span>
              </div>

              <div className="flex justify-between text-xs text-emerald-700">
                <span>Direct Designer Shipping</span>
                <span className="font-bold uppercase text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                  FREE SHIPPING
                </span>
              </div>

              <div className="pt-2 border-t border-cloud flex justify-between text-sm font-bold text-charcoal">
                <span>TOTAL PAYABLE NOW</span>
                <span className="font-mono text-lg font-extrabold text-charcoal">
                  {formatPrice(finalPrepaidTotalRupees)}
                </span>
              </div>
            </div>

            {error && <p className="text-xs text-red-700 bg-red-50 rounded-xl p-3 font-medium">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("address")}
                className="flex-1 py-3.5 border border-cloud rounded-full text-xs font-bold uppercase text-stone hover:bg-mist"
              >
                ← Back to Address
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-3.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md disabled:opacity-60 hover:bg-black"
              >
                {loading ? "Launching Gateway..." : `Pay ${formatPrice(finalPrepaidTotalRupees)} via Razorpay`}
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
