"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { StoryItem } from "@/lib/types";

interface StoryViewerProps {
  story: StoryItem;
  onClose: () => void;
  onNext: () => void;
}

export function StoryViewer({ story, onClose, onNext }: StoryViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const slide = story.slides[currentSlide];

  const goNextSlide = useCallback(() => {
    if (currentSlide < story.slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setProgressKey((prev) => prev + 1);
    } else {
      onNext();
    }
  }, [currentSlide, story.slides.length, onNext]);

  const goPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setProgressKey((prev) => prev + 1);
    }
  };

  // Auto-advance timer (5s per slide)
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(goNextSlide, 5000);
    return () => clearTimeout(timer);
  }, [currentSlide, paused, goNextSlide, progressKey]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrevSlide();
    } else {
      goNextSlide();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black flex flex-col">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-3 pt-3">
        {story.slides.map((_, i) => (
          <div key={i} className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden">
            {i < currentSlide && (
              <div className="h-full w-full bg-white rounded-full" />
            )}
            {i === currentSlide && (
              <div
                key={progressKey}
                className="h-full bg-white rounded-full"
                style={{ animation: paused ? "none" : "story-progress 5s linear forwards" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Header: Designer info + Close */}
      <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
            <Image
              src={story.designerLogo}
              alt={story.designerName}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <span className="font-sans text-xs font-semibold text-white uppercase tracking-wide">
            {story.designerName}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="touch-target flex items-center justify-center"
          aria-label="Close story"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Image — tap zones */}
      <div
        className="flex-1 relative cursor-pointer"
        onClick={handleTap}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <Image
          src={slide.image}
          alt={slide.caption || story.designerName}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      </div>

      {/* Caption + CTA */}
      <div className="absolute bottom-8 left-0 right-0 px-5 z-10">
        {slide.caption && (
          <p className="font-sans text-sm text-white/90 leading-relaxed mb-4">
            {slide.caption}
          </p>
        )}
        {slide.ctaLabel && slide.ctaLink && (
          <Link
            href={slide.ctaLink}
            onClick={onClose}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#2B2B2B] font-sans text-xs font-semibold uppercase tracking-wider rounded-full btn-press"
          >
            {slide.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
