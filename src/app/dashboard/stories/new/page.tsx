"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/Toast";

type Slide = {
  image: string;
  videoUrl?: string;
  caption: string;
  ctaLabel: string;
  ctaLink: string;
};

export default function NewStoryPage() {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [label, setLabel] = useState("Couture Preview");
  const [isHighlight, setIsHighlight] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([
    { image: "", caption: "", ctaLabel: "Shop Now", ctaLink: "/store" },
  ]);

  async function handleSlideUpload(file: File | null, index: number) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "designer-stories");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && (data?.data?.secureUrl || data?.url)) {
        const url = data?.data?.secureUrl || data?.url;
        setSlides((prev) =>
          prev.map((s, i) => (i === index ? { ...s, image: url } : s))
        );
        push("Slide media uploaded", "ok");
      } else {
        push("Upload failed", "err");
      }
    } catch {
      push("Upload failed", "err");
    } finally {
      setUploading(false);
    }
  }

  function addSlide() {
    if (slides.length >= 10) {
      return push("Maximum 10 slides per story", "err");
    }
    setSlides((prev) => [
      ...prev,
      { image: "", caption: "", ctaLabel: "Shop Now", ctaLink: "/store" },
    ]);
  }

  function removeSlide(index: number) {
    if (slides.length <= 1) {
      return push("At least 1 slide is required", "err");
    }
    setSlides((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (slides.some((s) => !s.image)) {
      return push("Please upload media for all slides", "err");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          isHighlight,
          slides,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        push("Story published to customer feed!", "ok");
        router.push("/dashboard/stories");
      } else {
        push(data?.error?.message || "Failed to publish story", "err");
      }
    } catch {
      push("Failed to publish story", "err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/stories" className="text-xs text-stone hover:text-charcoal font-semibold">
        ← Back to Stories
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          Create Multi-Slide Story
        </h1>
        <p className="text-xs text-stone mt-1">
          Build up to 10 slides with CTA buttons visible in customer feed story trays
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-cloud space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Story Highlight Title *
            </span>
            <input
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Bridal Runway '26"
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 text-xs font-semibold text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={isHighlight}
                onChange={(e) => setIsHighlight(e.target.checked)}
                className="rounded accent-charcoal"
              />
              Permanent Profile Highlight (Do not expire in 24h)
            </label>
          </div>
        </div>

        {/* Slides Builder */}
        <div className="space-y-6 pt-4 border-t border-cloud">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">
              Story Slides ({slides.length}/10)
            </h2>
            <button
              type="button"
              onClick={addSlide}
              className="px-4 py-1.5 bg-mist text-charcoal text-xs font-bold uppercase rounded-full border border-cloud hover:bg-cloud"
            >
              + Add Slide
            </button>
          </div>

          <div className="space-y-4">
            {slides.map((slide, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-cloud bg-mist/20 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-charcoal">
                    Slide #{idx + 1}
                  </span>
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      className="text-xs text-red-700 underline"
                    >
                      Remove Slide
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    {slide.image ? (
                      <div className="relative aspect-9/16 rounded-xl overflow-hidden border border-cloud bg-black/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slide.image} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setSlides((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, image: "" } : s))
                            )
                          }
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-9/16 rounded-xl border-2 border-dashed border-cloud bg-white flex flex-col items-center justify-center text-center p-3 space-y-2">
                        <span className="text-xl">📸</span>
                        <p className="text-[10px] font-bold text-stone">Slide Media</p>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => handleSlideUpload(e.target.files?.[0] || null, idx)}
                          className="hidden"
                          id={`slide-file-${idx}`}
                        />
                        <label
                          htmlFor={`slide-file-${idx}`}
                          className="px-3 py-1.5 bg-charcoal text-paper text-[10px] font-bold uppercase rounded-full cursor-pointer"
                        >
                          Upload
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                        Overlay Caption Text
                      </span>
                      <input
                        value={slide.caption}
                        onChange={(e) =>
                          setSlides((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, caption: e.target.value } : s))
                          )
                        }
                        placeholder="Hand-embroidered silk organza details"
                        className="mt-1 w-full rounded-xl border border-cloud bg-white px-3 py-2 text-xs outline-none"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                          CTA Button Label
                        </span>
                        <input
                          value={slide.ctaLabel}
                          onChange={(e) =>
                            setSlides((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, ctaLabel: e.target.value } : s))
                            )
                          }
                          placeholder="Shop Piece"
                          className="mt-1 w-full rounded-xl border border-cloud bg-white px-3 py-2 text-xs outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                          CTA Target URL
                        </span>
                        <input
                          value={slide.ctaLink}
                          onChange={(e) =>
                            setSlides((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, ctaLink: e.target.value } : s))
                            )
                          }
                          placeholder="/store"
                          className="mt-1 w-full rounded-xl border border-cloud bg-white px-3 py-2 text-xs outline-none"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-cloud flex justify-end gap-2">
          <Link
            href="/dashboard/stories"
            className="px-6 py-3 border border-cloud text-stone text-xs font-bold uppercase rounded-full"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-8 py-3 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md disabled:opacity-60"
          >
            {loading ? "Publishing Story…" : "Publish Story to Feed"}
          </button>
        </div>
      </form>
    </div>
  );
}
