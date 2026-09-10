"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MoreVertical, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ChevronDown, 
  Check, 
  MapPin, 
  Sparkles,
  Tag
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/mock-data";

const SAMPLE_LOCATIONS = [
  "Tegalsari, Surabaya",
  "Bandra West, Mumbai",
  "Indiranagar, Bengaluru",
  "Chanakyapuri, New Delhi",
  "Jubilee Hills, Hyderabad"
];

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCart();

  const [deliveryLocation, setDeliveryLocation] = useState("Tegalsari, Surabaya");
  const [recipientName, setRecipientName] = useState("Rex Hypebeast");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Coupon state matching reference "SD7A97W" + "Available ✓"
  const [couponInput, setCouponInput] = useState("SD7A97W");
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponMessage, setCouponMessage] = useState("");

  // Calculations
  const deliveryFee = 0; // Free delivery
  const discountAmount = couponApplied && total > 0 ? Math.min(total, Math.round(total * 0.1) || 500) : 0;
  const finalTotal = Math.max(0, total - discountAmount + deliveryFee);

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) {
      setCouponApplied(false);
      setCouponMessage("Please enter a coupon code");
      return;
    }
    setCouponApplied(true);
    setCouponMessage("Coupon applied successfully!");
    setTimeout(() => setCouponMessage(""), 2500);
  };

  return (
    <>
      {/* Desktop TopBar */}
      <div className="hidden md:block">
        <TopBar />
      </div>

      <main className="min-h-screen bg-white pb-36 md:pb-16 text-[#1A1A1A]">
        {/* Top Header Bar matching reference: [ ← ]  Cart  [ ⋮ ] */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>

          <h1 className="font-sans text-base font-bold text-gray-900 tracking-tight text-center">
            Cart
          </h1>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="w-10 h-10 -mr-1 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="Cart options"
            >
              <MoreVertical className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Items</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLocationModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>Change Destination</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 pt-3">
          {items.length > 0 ? (
            <div className="space-y-4">
              {/* Delivery Destination Bar matching reference */}
              <div className="bg-[#F8F9FB] rounded-2xl p-3.5 border border-gray-100 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#EA580C] font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {recipientName.charAt(0)}
                  </div>
                  <div className="text-xs truncate">
                    <span className="text-gray-500">Ship to </span>
                    <span className="font-bold text-gray-900">{recipientName}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] flex items-center gap-1 flex-shrink-0 active:scale-95 transition-all"
                >
                  <span className="truncate max-w-[130px]">{deliveryLocation}</span>
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 pt-1">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3.5"
                  >
                    {/* Soft-gray square image tile */}
                    <Link
                      href={`/product/${item.productId}`}
                      className="relative w-20 h-20 rounded-2xl bg-[#F5F6F8] p-1.5 flex items-center justify-center flex-shrink-0 overflow-hidden group"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1 group-hover:scale-105 transition-transform"
                        sizes="80px"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/product/${item.productId}`}
                            className="font-sans text-sm font-bold text-gray-900 truncate block hover:text-[#FF6B00] transition-colors"
                          >
                            {item.name}
                          </Link>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                            Size: <span className="text-gray-700 font-semibold">{item.size}</span>
                          </p>
                        </div>

                        {/* Trash remove icon */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-gray-300 hover:text-rose-500 p-1 rounded-full transition-colors active:scale-90"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price & Stepper Row */}
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="font-sans text-base font-extrabold text-gray-900">
                          {formatPrice(item.price)}
                        </span>

                        {/* Stepper with Luxury Orange Plus button */}
                        <div className="flex items-center gap-2 bg-[#F8F9FA] px-2 py-1 rounded-full border border-gray-100">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all text-xs font-bold"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <span className="text-xs font-bold text-gray-900 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white flex items-center justify-center active:scale-90 transition-all shadow-xs text-xs font-bold"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Have a coupon code? section */}
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-800 mb-2">
                  Have a coupon code?
                </p>
                <div className="relative rounded-full border border-gray-200 bg-white p-1.5 pl-4 flex items-center justify-between shadow-2xs focus-within:border-[#FF6B00] transition-colors">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponApplied(false);
                    }}
                    placeholder="Enter coupon code"
                    className="w-full text-xs font-bold tracking-wider text-gray-800 placeholder:text-gray-400 focus:outline-hidden bg-transparent"
                  />
                  {couponApplied ? (
                    <button
                      type="button"
                      onClick={() => setCouponApplied(false)}
                      className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-bold flex items-center gap-1 hover:bg-orange-100 flex-shrink-0 transition-colors"
                    >
                      <span>Available</span>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-1.5 rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold flex-shrink-0 transition-colors shadow-xs"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {couponMessage && (
                  <p className="mt-1 text-[11px] font-semibold text-[#EA580C] pl-3">
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Order Summary breakdown matching reference */}
              <div className="bg-[#F8F9FB] rounded-2xl p-4 border border-gray-100 space-y-2.5 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Sub Total</span>
                  <span className="text-gray-900 font-bold">{formatPrice(total)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Delivery Fee</span>
                  <span className="text-[#EA580C] font-bold">Free</span>
                </div>

                {couponApplied && discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Discount</span>
                    <span className="text-[#EA580C] font-bold">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}

                {/* Dashed divider */}
                <div className="border-t border-dashed border-gray-200 my-1 pt-1" />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-extrabold text-gray-900">Total</span>
                  <span className="text-lg font-extrabold text-gray-900">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Desktop Checkout Button */}
              <div className="hidden md:block pt-2">
                <Link
                  href="/checkout"
                  className="w-full py-4 rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Checkout ({formatPrice(finalTotal)})</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Empty Cart View */
            <div className="py-20 text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#F5F6F8] flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Cart is Empty</h2>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Explore curated drops and bespoke designer pieces to begin your order.
                </p>
              </div>
              <div className="pt-3">
                <Link
                  href="/category"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#FF6B00] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#EA580C] transition-all shadow-md shadow-orange-500/20"
                >
                  Explore Collections
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Checkout Bar */}
        {items.length > 0 && (
          <div
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 pt-3 pb-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <Link
              href="/checkout"
              className="w-full py-3.5 rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Checkout
            </Link>
          </div>
        )}

        {/* Destination Picker Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                  <span>Choose Delivery Location</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-hidden focus:border-[#FF6B00]"
                  placeholder="e.g. Rex Hypebeast"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider">
                  Select Destination Area
                </label>
                {SAMPLE_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setDeliveryLocation(loc);
                      setShowLocationModal(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      deliveryLocation === loc
                        ? "bg-orange-50 text-[#EA580C] border border-orange-200"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{loc}</span>
                    {deliveryLocation === loc && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
