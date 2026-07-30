"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, itemCount, clearCart, refreshCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [useNew, setUseNew] = useState(false);
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

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok && Array.isArray(body.data?.addresses)) {
          setAddresses(body.data.addresses);
          const def =
            body.data.addresses.find((a: Address) => a.isDefault) ||
            body.data.addresses[0];
          if (def) setAddressId(def.id);
          if (body.data.addresses.length === 0) setUseNew(true);
        } else {
          setUseNew(true);
        }
      })
      .catch(() => setUseNew(true));
  }, []);

  if (itemCount === 0) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen px-4 py-20 text-center">
          <h1 className="font-display text-2xl text-charcoal mb-2">Checkout</h1>
          <p className="text-sm text-stone mb-6">Your bag is empty.</p>
          <Link
            href="/store"
            className="inline-flex px-6 py-3 bg-charcoal text-paper text-xs uppercase tracking-wider rounded-full"
          >
            Continue shopping
          </Link>
        </main>
        <BottomNav />
      </>
    );
  }

  async function onPlaceOrder(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload =
        !useNew && addressId
          ? { addressId }
          : {
              shippingAddress: {
                fullName: form.fullName.trim(),
                phone: form.phone.trim() || null,
                line1: form.line1.trim(),
                line2: form.line2.trim() || null,
                city: form.city.trim(),
                state: form.state.trim(),
                postalCode: form.postalCode.trim(),
                country: form.country.trim() || "IN",
              },
            };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || body?.ok === false) {
        throw new Error(body?.error?.message || "Could not place order");
      }
      const orderId = body.data?.order?.id;
      if (!orderId) throw new Error("Order created without id");
      await clearCart();
      await refreshCart();
      router.replace(`/orders/${orderId}?placed=1`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-24">
        <div className="px-4 pt-5 pb-4">
          <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
            Checkout
          </h1>
          <p className="font-sans text-xs text-[#7A7A7A] mt-1">
            {step === "address" ? "Shipping address" : "Review & place order"}
          </p>
        </div>

        {step === "address" ? (
          <div className="px-4 space-y-4">
            {addresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-stone">
                  Saved addresses
                </p>
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex gap-3 p-4 rounded-xl border cursor-pointer ${
                      !useNew && addressId === a.id
                        ? "border-charcoal bg-mist"
                        : "border-cloud"
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
                      className="mt-1"
                    />
                    <span className="text-sm text-charcoal">
                      <span className="font-semibold block">{a.fullName}</span>
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}
                      <br />
                      {a.city}, {a.state} {a.postalCode}
                    </span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setUseNew(true)}
                  className="text-xs uppercase tracking-wider underline text-stone"
                >
                  Use a new address
                </button>
              </div>
            )}

            {useNew && (
              <div className="space-y-3">
                {(
                  [
                    ["fullName", "Full name"],
                    ["phone", "Phone"],
                    ["line1", "Address line 1"],
                    ["line2", "Address line 2 (optional)"],
                    ["city", "City"],
                    ["state", "State"],
                    ["postalCode", "Postal code"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="text-xs uppercase tracking-wider text-stone">
                      {label}
                    </span>
                    <input
                      required={key !== "line2" && key !== "phone"}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-sm"
                    />
                  </label>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (useNew) {
                  if (
                    !form.fullName.trim() ||
                    !form.line1.trim() ||
                    !form.city.trim() ||
                    !form.state.trim() ||
                    !form.postalCode.trim()
                  ) {
                    setError("Please complete the shipping address");
                    return;
                  }
                } else if (!addressId) {
                  setError("Select a shipping address");
                  return;
                }
                setError(null);
                setStep("review");
              }}
              className="w-full h-12 bg-[#2B2B2B] text-[#FAFAFA] text-xs font-semibold uppercase tracking-wider rounded-full"
            >
              Continue to review
            </button>
            {error && (
              <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={onPlaceOrder} className="px-4 space-y-4">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-3 p-3 bg-[#F0F0F0] rounded-xl"
                >
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[#E0E0E0] flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-stone uppercase">{item.brand}</p>
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-stone">
                      Size {item.size} · Qty {item.quantity}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border border-cloud rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone">
                <span>Payment</span>
                <span>Placeholder — confirm later</span>
              </div>
              <p className="text-xs text-stone pt-2">
                Orders are created with payment status pending. No charge is
                taken until payment integration is enabled.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("address")}
                className="flex-1 h-12 border border-cloud rounded-full text-xs uppercase tracking-wider"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-[#2B2B2B] text-[#FAFAFA] text-xs font-semibold uppercase tracking-wider rounded-full disabled:opacity-60"
              >
                {loading ? "Placing…" : "Place order"}
              </button>
            </div>
          </form>
        )}
      </main>
      <BottomNav />
    </>
  );
}
