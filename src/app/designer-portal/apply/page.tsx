"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

const AVAILABLE_CATEGORIES = [
  "Lehengas",
  "Sarees",
  "Kurtas & Sherwanis",
  "Indo-Western",
  "Gowns & Dresses",
  "Accessories & Jewelry",
  "Footwear",
];

const PRICE_RANGES = [
  "₹5K–10K",
  "₹10K–50K",
  "₹50K–1L",
  "₹1L+",
];

export default function DesignerApplyPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    applicantCity: "",
    brandName: "",
    brandStory: "",
    designPhilosophy: "",
    instagramHandle: "",
    websiteUrl: "",
    categories: [] as string[],
    priceRange: "₹10K–50K",
    portfolioImages: [] as string[],
  });

  function toggleCategory(cat: string) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("folder", "designer-portfolios");

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data?.ok && data?.data?.secureUrl) {
          uploadedUrls.push(data.data.secureUrl);
        } else if (res.ok && data?.url) {
          uploadedUrls.push(data.url);
        }
      }
      setForm((f) => ({
        ...f,
        portfolioImages: [...f.portfolioImages, ...uploadedUrls],
      }));
    } catch {
      setError("Failed to upload portfolio image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setForm((f) => ({
      ...f,
      portfolioImages: f.portfolioImages.filter((_, i) => i !== index),
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.portfolioImages.length === 0) {
      return setError("Please upload at least 1 high-resolution portfolio image.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/designer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error?.message || "Failed to submit application");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-paper pb-24 px-4 pt-6 max-w-2xl mx-auto">
        <Link href="/designer-portal" className="text-xs text-stone hover:text-charcoal font-semibold">
          ← Back to Designer Portal
        </Link>

        {submitted ? (
          <div className="mt-6 bg-white p-8 rounded-3xl border border-cloud text-center space-y-4 shadow-sm">
            <span className="text-4xl">🎉</span>
            <h1 className="font-display text-2xl font-bold uppercase text-charcoal">
              Application Submitted Successfully!
            </h1>
            <p className="text-xs text-stone max-w-md mx-auto leading-relaxed">
              Thank you for applying to join Designer&apos;s Street. Our curation board is reviewing your brand profile and portfolio. You will receive an email update at <strong className="text-charcoal">{form.applicantEmail}</strong> within 48 hours.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="px-6 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full inline-block"
              >
                Return to Shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-charcoal/5 px-3 py-1 rounded-full">
                Step {step} of 4
              </span>
              <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-charcoal mt-2">
                Designer Portfolio Application
              </h1>
              <p className="text-xs text-stone mt-1">
                Apply for a verified Studio account on Designer&apos;s Street
              </p>
            </div>

            {/* Progress Stepper */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    s <= step ? "bg-charcoal" : "bg-cloud"
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-700 bg-red-50 rounded-xl p-3 font-medium">
                {error}
              </p>
            )}

            <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
              {/* STEP 1: PERSONAL INFORMATION */}
              {step === 1 && (
                <div className="space-y-3">
                  <h2 className="font-display text-sm font-bold uppercase text-charcoal pb-2 border-b border-cloud">
                    1. Applicant Information
                  </h2>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                      Full Name *
                    </span>
                    <input
                      required
                      value={form.applicantName}
                      onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                      placeholder="e.g. Sabyasachi Mukherjee"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                      Email Address *
                    </span>
                    <input
                      required
                      type="email"
                      value={form.applicantEmail}
                      onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })}
                      placeholder="designer@houseofbrand.com"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                        Phone Number *
                      </span>
                      <input
                        required
                        value={form.applicantPhone}
                        onChange={(e) => setForm({ ...form, applicantPhone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                        Base City *
                      </span>
                      <input
                        required
                        value={form.applicantCity}
                        onChange={(e) => setForm({ ...form, applicantCity: e.target.value })}
                        placeholder="e.g. Mumbai, New Delhi"
                        className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.applicantName || !form.applicantEmail || !form.applicantPhone || !form.applicantCity) {
                        return setError("Please fill all applicant details before continuing.");
                      }
                      setError(null);
                      setStep(2);
                    }}
                    className="w-full py-3 mt-4 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full"
                  >
                    Continue to Brand Story →
                  </button>
                </div>
              )}

              {/* STEP 2: BRAND STORY & SOCIAL */}
              {step === 2 && (
                <div className="space-y-3">
                  <h2 className="font-display text-sm font-bold uppercase text-charcoal pb-2 border-b border-cloud">
                    2. Brand Identity &amp; Philosophy
                  </h2>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                      Brand / House Name *
                    </span>
                    <input
                      required
                      value={form.brandName}
                      onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                      placeholder="e.g. Atelier House of Luxury"
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                      Founding Story &amp; Heritage *
                    </span>
                    <textarea
                      required
                      rows={3}
                      value={form.brandStory}
                      onChange={(e) => setForm({ ...form, brandStory: e.target.value })}
                      placeholder="Describe your brand origin, craft heritage, or signature techniques..."
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                      Design Philosophy (Optional)
                    </span>
                    <textarea
                      rows={2}
                      value={form.designPhilosophy}
                      onChange={(e) => setForm({ ...form, designPhilosophy: e.target.value })}
                      placeholder="Sustainably handcrafted heritage couture with modern silhouette..."
                      className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                        Instagram Handle
                      </span>
                      <input
                        value={form.instagramHandle}
                        onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })}
                        placeholder="@houseofbrand"
                        className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                        Website URL
                      </span>
                      <input
                        value={form.websiteUrl}
                        onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                        placeholder="https://houseofbrand.com"
                        className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                      />
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-cloud text-stone text-xs font-bold uppercase rounded-full"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!form.brandName || !form.brandStory) {
                          return setError("Please fill Brand Name and Founding Story.");
                        }
                        setError(null);
                        setStep(3);
                      }}
                      className="flex-1 py-3 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full"
                    >
                      Continue to Categories →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CATEGORIES & PRICING */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-display text-sm font-bold uppercase text-charcoal pb-2 border-b border-cloud">
                    3. Categories &amp; Price Positioning
                  </h2>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone block mb-2">
                      Target Categories (Multi-select)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-2 text-xs font-bold uppercase rounded-xl border transition-colors ${
                            form.categories.includes(cat)
                              ? "bg-charcoal text-paper border-charcoal"
                              : "bg-mist text-stone border-cloud hover:border-stone"
                          }`}
                        >
                          {form.categories.includes(cat) ? "✓ " : ""}{cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone block mb-2">
                      Core Price Segment
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {PRICE_RANGES.map((pr) => (
                        <button
                          key={pr}
                          type="button"
                          onClick={() => setForm({ ...form, priceRange: pr })}
                          className={`py-3 text-xs font-bold uppercase rounded-xl border transition-colors ${
                            form.priceRange === pr
                              ? "bg-charcoal text-paper border-charcoal"
                              : "bg-mist text-stone border-cloud hover:border-stone"
                          }`}
                        >
                          {pr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 border border-cloud text-stone text-xs font-bold uppercase rounded-full"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep(4);
                      }}
                      className="flex-1 py-3 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full"
                    >
                      Continue to Portfolio →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PORTFOLIO UPLOAD & SUBMIT */}
              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="font-display text-sm font-bold uppercase text-charcoal pb-2 border-b border-cloud">
                    4. Upload Work Portfolio (High-Res Samples)
                  </h2>

                  <p className="text-xs text-stone">
                    Upload 1 to 10 high-resolution photos showcasing your craftsmanship, campaign imagery, or garment details.
                  </p>

                  <div className="border-2 border-dashed border-cloud rounded-2xl p-6 text-center space-y-2 bg-mist/30">
                    <span className="text-2xl">📸</span>
                    <p className="text-xs font-bold text-charcoal">
                      {uploading ? "Uploading images…" : "Click or drop images here"}
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="portfolio-upload-input"
                    />
                    <label
                      htmlFor="portfolio-upload-input"
                      className="inline-block px-4 py-2 bg-charcoal text-paper text-xs font-bold uppercase rounded-full cursor-pointer hover:bg-black"
                    >
                      Select Images
                    </label>
                  </div>

                  {form.portfolioImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                      {form.portfolioImages.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-cloud group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Sample ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 border border-cloud text-stone text-xs font-bold uppercase rounded-full"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploading}
                      className="flex-1 py-3 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full disabled:opacity-60 shadow-md"
                    >
                      {loading ? "Submitting Application…" : "Submit Portfolio Application"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
