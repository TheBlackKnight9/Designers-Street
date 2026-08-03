"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  href?: string;
};

type NewmeHeroCarouselProps = {
  slides: HeroSlide[];
};

export function NewmeHeroCarousel({ slides }: NewmeHeroCarouselProps) {
  const [active, setActive] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [count]);

  if (!count) return null;

  const slide = slides[active];

  const content = (
    <div className="relative w-full aspect-[3/4] max-h-[78vh] bg-mist overflow-hidden">
      <Image
        src={slide.image}
        alt={slide.title || "Campaign"}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      {(slide.title || slide.subtitle) && (
        <div className="absolute bottom-14 left-4 right-4 text-paper">
          {slide.subtitle && (
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1 opacity-90">
              {slide.subtitle}
            </p>
          )}
          {slide.title && (
            <h2 className="text-2xl font-black uppercase leading-tight tracking-tight drop-shadow-md">
              {slide.title}
            </h2>
          )}
        </div>
      )}
      {count > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-paper" : "w-1.5 bg-paper/50"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (slide.href) {
    return (
      <Link href={slide.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
