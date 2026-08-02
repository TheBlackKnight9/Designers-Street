"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/Toast";
import { MediaGalleryUploader } from "@/components/dashboard/MediaGalleryUploader";

type Slide = {
  image: string;
  videoUrl?: string;
  caption: string;
  ctaLabel: string;
  ctaLink: string;
};

const CTA_PRESETS = [
  { label: "Shop Piece", link: "/store" },
  { label: "Request Bespoke Quote", link: "/atelier" },
  { label: "Book Appointment", link: "/appointments" },
  { label: "View Collection", link: "/designers" },
];

export default function NewStoryPage() {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number | null>(null);

  const [label, setLabel] = useState("Couture Preview");
  const [isHighlight, setIsHighlight] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([
    { image: "", caption: "", ctaLabel: "Shop Piece", ctaLink: "/store" },
  ]);

  function addSlide() {
    if (slides.length >= 10) {
      return push("Maximum 10 slides per story", "err");
    }
    setSlides((prev) => [
      ...prev,
      { image: "", caption: "", ctaLabel: "Shop Piece", ctaLink: "/store" },
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
      return push("Please provide media for all slides", "err");
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
      push("Failed to publish story due to network error", "err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <Link
        href="/dashboard/stories"
        className="text-xs text-stone hover:text-charcoal font-semibold flex items-center gap-1"
      >
        ← Back to Stories Studio
      </Link>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone">
          Universal Content Studio
        </p>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          Create Multi-Slide Story
        </h1>
        <p className="text-xs text-stone mt-0.5">
          Build up to 10 slides with CTA buttons visible in customer feed story trays
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-cloud space-y-6 shadow-xs">
        {/* Story Title & Duration */}
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
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40 font-semibold"
            />
          </label>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 text-xs font-semibold text-charcoal cursor-pointer bg-mist/60 p-3 rounded-xl border border-cloud w-full">
              <input
                type="checkbox"
                checked={isHighlight}
                onChange={(e) => setIsHighlight(e.target.checked)}
                className="rounded accent-charcoal"
              />
              Permanent Profile Highlight (Does not expire in 24h)
            </label>
          </div>
        </div>

        {/* Slides Builder */}
        <div className="space-y-6 pt-4 border-t border-cloud">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-bold uppercase text-charcoal">
                Story Slides ({slides.length}/10)
              </h2>
              <p className="text-[11px] text-stone">Photos or short videos (&lt;30s) per slide</p>
            </div>
            <button
              type="button"
              onClick={addSlide}
              className="px-4 py-2 bg-charcoal text-paper text-xs font-bold uppercase rounded-full hover:bg-black transition-colors"
            >
              + Add Slide
            </button>
          </div>

          <div className="space-y-6">
            {slides.map((slide, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-cloud bg-mist/20 space-y-4 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal bg-white px-3 py-1 rounded-lg border border-cloud">
                    Slide #{idx + 1}
                  </span>
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      className="text-xs text-red-700 hover:underline font-bold"
                    >
                      Remove Slide
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Media Column */}
                  <div>
                    {slide.image ? (
                      <div className="relative aspect-9/16 rounded-xl overflow-hidden border border-cloud bg-black/5 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slide.image} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setSlides((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, image: "" } : s))
                            )
                          }
                          className="absolute top-2 right-2 bg-black/80 text-white rounded-full px-2 py-0.5 text-[10px] font-bold"
                        >
                          ✕ Change
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeSlideIdx === idx ? (
                          <MediaGalleryUploader
                            label={`Upload Media for Slide #${idx + 1}`}
                            folder="story-slides"
                            onMediaAdded={(item) => {
                              setSlides((prev) =>
                                prev.map((s, i) => (i === idx ? { ...s, image: item.url } : s))
                              );
                              setActiveSlideIdx(null);
                            }}
                          />
                        ) : (
                          <div
                            onClick={() => setActiveSlideIdx(idx)}
                            className="aspect-9/16 rounded-xl border-2 border-dashed border-cloud bg-white flex flex-col items-center justify-center text-center p-3 space-y-2 cursor-pointer hover:border-charcoal transition-colors"
                          >
                            <span className="text-2xl">📸</span>
                            <p className="text-xs font-bold text-charcoal">Add Slide Media</p>
                            <p className="text-[10px] text-stone">Click to upload file or paste image URL</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Details Column */}
                  <div className="sm:col-span-2 space-y-4">
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                        Slide Caption Overlay
                      </span>
                      <input
                        value={slide.caption}
                        onChange={(e) =>
                          setSlides((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, caption: e.target.value } : s))
                          )
                        }
                        placeholder="Hand-embroidered silk organza details"
                        className="mt-1 w-full rounded-xl border border-cloud bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                          CTA Button Text
                        </span>
                        <input
                          value={slide.ctaLabel}
                          onChange={(e) =>
                            setSlides((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, ctaLabel: e.target.value } : s))
                            )
                          }
                          placeholder="Shop Piece"
                          className="mt-1 w-full rounded-xl border border-cloud bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                          CTA Target Link
                        </span>
                        <input
                          value={slide.ctaLink}
                          onChange={(e) =>
                            setSlides((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, ctaLink: e.target.value } : s))
                            )
                          }
                          placeholder="/store"
                          className="mt-1 w-full rounded-xl border border-cloud bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40 font-mono"
                        />
                      </label>
                    </div>

                    {/* CTA Presets */}
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-stone block mb-1">
                        Quick CTA Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {CTA_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              setSlides((prev) =>
                                prev.map((s, i) =>
                                  i === idx
                                    ? { ...s, ctaLabel: preset.label, ctaLink: preset.link }
                                    : s
                                )
                              )
                            }
                            className="px-2 py-0.5 bg-white text-stone text-[10px] font-bold rounded border border-cloud hover:border-charcoal hover:text-charcoal"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-cloud flex justify-end gap-2">
          <Link
            href="/dashboard/stories"
            className="px-6 py-3 border border-cloud text-stone text-xs font-bold uppercase rounded-full hover:bg-mist"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-black disabled:opacity-60 transition-colors"
          >
            {loading ? "Publishing Story…" : "Publish Story to Customer Feed"}
          </button>
        </div>
      </form>
    </div>
  );
}
