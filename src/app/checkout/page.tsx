"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/mock-data";

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
  const [breakdown, setBreakdown] = useState<any>(null);

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
            fetchBreakdown(def.postalCode);
          }
          if (body.data.addresses.length === 0) setUseNew(true);
        } else {
          setUseNew(true);
        }
      })
      .catch(() => setUseNew(true));
  }, []);

  // India Post PIN Auto-Fill API
  async function handlePinLookup(pincode: string) {
    setForm((f) => ({ ...f, postalCode: pincode }));
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPinLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.[0]) {
          const po = data[0].PostOffice[0];
          setForm((f) => ({
            ...f,
            city: po.District || po.Block || f.city,
            state: po.State || f.state,
          }));
        }
      } catch {
        /* fallback manual entry */
      } finally {
        setPinLoading(false);
        fetchBreakdown(pincode);
      }
    }
  }

  async function fetchBreakdown(pincode: string) {
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode, items }),
      });
      const data = await res.json();
      if (data?.ok && data.data?.breakdown) {
        setBreakdown(data.data.breakdown);
      }
    } catch {
      /* fallback */
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

  async function onPlaceOrder(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const selectedAddr = addresses.find((a) => a.id === addressId);
    const pincode = useNew ? form.postalCode : selectedAddr?.postalCode || "110001";

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error?.message || "Order creation failed");
      }

      const { razorpayOrderId, keyId, amount } = data.data;

      // Load Razorpay SDK
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: "INR",
        name: "Designer's Street",
        description: "Curated Luxury Fashion Order",
        order_id: razorpayOrderId.startsWith("order_rzp_mock") ? undefined : razorpayOrderId,
        handler: async function (response: any) {
          await clearCart();
          await refreshCart();
          router.replace(`/orders/confirmation?razorpay_payment_id=${response.razorpay_payment_id || "pay_mock"}`);
        },
        prefill: {
          name: useNew ? form.fullName : selectedAddr?.fullName,
          contact: useNew ? form.phone : selectedAddr?.phone,
        },
        theme: {
          color: "#101010",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            router.push("/checkout/failed?reason=dismissed");
          },
        },
      };

      if (window.Razorpay && !keyId.startsWith("rzp_test_mock")) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Test mode fallback
        await clearCart();
        await refreshCart();
        router.replace(`/orders/confirmation?razorpay_payment_id=pay_mock_${Date.now()}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout error");
      setLoading(false);
    }
  }

  // Group items by designer
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
            {step === "address" ? "Step 1 of 2: Shipping Address & Delivery Origin" : "Step 2 of 2: Review & Secure Payment"}
          </p>
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
                        fetchBreakdown(a.postalCode);
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
                  Delivery Address Details
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">PIN Code *</span>
                    <input
                      required
                      maxLength={6}
                      value={form.postalCode}
                      onChange={(e) => handlePinLookup(e.target.value)}
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">City *</span>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">State *</span>
                    <input
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none"
                    />
                  </label>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (useNew) {
                  if (!form.fullName.trim() || !form.line1.trim() || !form.city.trim() || !form.postalCode.trim()) {
                    return setError("Please complete all required address fields");
                  }
                } else if (!addressId) {
                  return setError("Select a delivery address to proceed");
                }
                setError(null);
                setStep("review");
              }}
              className="w-full py-3.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-black"
            >
              Continue to Order Breakdown →
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
                    <span className="text-[10px] font-bold uppercase text-stone bg-mist px-2.5 py-1 rounded-md">
                      Dispatched Direct from Atelier
                    </span>
                  </div>

                  <div className="space-y-2">
                    {brandItems.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                        <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-mist border border-cloud shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-charcoal truncate">{item.name}</p>
                          <p className="text-[10px] text-stone">Size: {item.size} · Qty: {item.quantity}</p>
                          <p className="text-xs font-mono font-bold text-charcoal mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial & Shipping Fee Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-cloud space-y-3 shadow-xs">
              <h2 className="font-display text-sm font-bold uppercase text-charcoal pb-2 border-b border-cloud">
                Financial Summary &amp; Multi-Zone Shipping
              </h2>

              <div className="flex justify-between text-xs text-stone">
                <span>Product Subtotal</span>
                <span className="font-mono font-bold text-charcoal">{formatPrice(total)}</span>
              </div>

              <div className="flex justify-between text-xs text-stone">
                <span>Direct Designer Shipping Fees</span>
                <span className="font-mono font-bold text-charcoal">
                  {breakdown?.grandShippingFee ? `₹${breakdown.grandShippingFee / 100}` : "₹149"}
                </span>
              </div>

              <div className="pt-2 border-t border-cloud flex justify-between text-sm font-bold text-charcoal">
                <span>Grand Total</span>
                <span className="font-mono text-base">
                  {formatPrice(total + (breakdown?.grandShippingFee ? breakdown.grandShippingFee / 100 : 149))}
                </span>
              </div>
            </div>

            {error && <p className="text-xs text-red-700 bg-red-50 rounded-xl p-3 font-medium">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("address")}
                className="flex-1 py-3.5 border border-cloud rounded-full text-xs font-bold uppercase text-stone"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-3.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md disabled:opacity-60 hover:bg-black"
              >
                {loading ? "Processing Payment…" : "Pay via Razorpay (UPI / Card)"}
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
