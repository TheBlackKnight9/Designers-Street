"use client";

import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import type { Category } from "@/lib/types";
import { getCategoryHero, getCategoryPrimary } from "@/lib/fashion-images";
import {
  CrosshairMark,
  ImageCornerBrackets,
  PixelClover,
  PixelFlower,
  PixelHeart,
  PixelMascotRow,
  PixelMoon,
  PixelRainbow,
  PixelSparkle,
  PixelStar,
} from "./PixelStickers";

const signatureFont = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const FRAME_PALETTES = [
  { grid: "#5BC4E8", border: "#0284C7", accent: "#0C4A6E", bar: "#0284C7" },
  { grid: "#F9A8D4", border: "#DB2777", accent: "#831843", bar: "#BE185D" },
  { grid: "#FDE68A", border: "#CA8A04", accent: "#713F12", bar: "#A16207" },
  { grid: "#86EFAC", border: "#16A34A", accent: "#14532D", bar: "#15803D" },
  { grid: "#C4B5FD", border: "#7C3AED", accent: "#4C1D95", bar: "#6D28D9" },
  { grid: "#FCA5A5", border: "#DC2626", accent: "#7F1D1D", bar: "#B91C1C" },
];

const STICKER_SETS = [
  [
    { Sticker: PixelHeart, className: "-left-2 top-[18%] -rotate-12", size: 30 },
    { Sticker: PixelHeart, className: "-left-1 top-[32%] rotate-6", size: 22 },
    { Sticker: PixelStar, className: "-left-2 bottom-[28%]", size: 26 },
    { Sticker: PixelMoon, className: "-right-2 top-[22%] rotate-12", size: 30 },
    { Sticker: PixelHeart, className: "-right-1 bottom-[30%] -rotate-6", size: 24 },
  ],
  [
    { Sticker: PixelRainbow, className: "-left-3 top-[24%] -rotate-6", size: 40 },
    { Sticker: PixelSparkle, className: "-left-1 top-[12%]", size: 22 },
    { Sticker: PixelHeart, className: "-right-2 top-[38%]", size: 28 },
    { Sticker: PixelClover, className: "-right-3 bottom-[22%] rotate-12", size: 34 },
    { Sticker: PixelStar, className: "-left-2 bottom-[18%]", size: 24 },
  ],
  [
    { Sticker: PixelFlower, className: "-right-3 top-[14%] -rotate-6", size: 36 },
    { Sticker: PixelHeart, className: "-left-2 top-[20%]", size: 26 },
    { Sticker: PixelHeart, className: "-left-1 bottom-[24%] rotate-12", size: 22 },
    { Sticker: PixelMoon, className: "-right-1 bottom-[32%]", size: 28 },
    { Sticker: PixelSparkle, className: "-right-2 top-[42%]", size: 20 },
  ],
];

function isValidImageUrl(url?: string | null): boolean {
  if (!url || url === "na" || url.trim() === "") return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

type NewmeCategoryMegaCardProps = {
  category: Category;
  index: number;
  imageOverride?: string;
  designerName?: string;
};

function resolveHeroImage(category: Category, imageOverride?: string): string {
  if (isValidImageUrl(imageOverride)) return imageOverride!;
  if (isValidImageUrl(category.image)) return category.image;
  return getCategoryHero(category.slug);
}

export function NewmeCategoryMegaCard({
  category,
  index,
  imageOverride,
  designerName,
}: NewmeCategoryMegaCardProps) {
  const palette = FRAME_PALETTES[index % FRAME_PALETTES.length];
  const stickers = STICKER_SETS[index % STICKER_SETS.length];
  const heroImage = resolveHeroImage(category, imageOverride);
  const signature = designerName?.trim() || "Atelier";
  const editLabel = `Shop Edit ${String(index + 1).padStart(2, "0")}`;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="block px-3 mb-6 active:scale-[0.98] transition-transform max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
        <span
          className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-paper shadow-[2px_2px_0_#0A0A0A] border border-charcoal"
          style={{ backgroundColor: palette.bar }}
        >
          {editLabel}
        </span>
        <PixelMascotRow />
      </div>

      <div className="relative">
        {stickers.map(({ Sticker, className, size }, i) => (
          <div
            key={i}
            className={`absolute z-20 pointer-events-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)] ${className}`}
          >
            <Sticker size={size} />
          </div>
        ))}

        <div
          className="rounded-[22px] p-2.5 border-[4px] border-charcoal shadow-[5px_5px_0_#0A0A0A]"
          style={{
            backgroundColor: palette.grid,
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <div className="rounded-[16px] bg-paper p-2 border-[3px] border-paper shadow-inner">
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-mist">
              <Image
                src={heroImage}
                alt={category.label}
                fill
                className="object-cover object-center"
                sizes="(max-width: 512px) 92vw, 480px"
                priority={index < 2}
              />

              <div
                className="absolute inset-0 pointer-events-none opacity-[0.12]"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              <div
                className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between gap-2 px-3 py-2 bg-charcoal/90"
              >
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-paper leading-tight truncate">
                  {category.label}
                </p>
                <CrosshairMark className="text-paper shrink-0 opacity-80" />
              </div>

              <ImageCornerBrackets />

              <div
                className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/50 via-black/15 to-transparent pointer-events-none"
              />

              <p
                className={`${signatureFont.className} absolute bottom-3 right-3 z-10 max-w-[72%] text-right text-[28px] leading-none text-charcoal -rotate-6 translate-x-0.5 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]`}
                style={{
                  textShadow:
                    "1px 1px 0 rgba(255,255,255,0.85), -1px -1px 0 rgba(255,255,255,0.5)",
                }}
              >
                {signature}
              </p>

              <div
                className="absolute bottom-3 left-3 z-10 max-w-[46%] rounded-sm border-2 border-charcoal shadow-[3px_3px_0_#0A0A0A] overflow-hidden"
              >
                <div className="flex items-center justify-between gap-1 px-2 py-0.5 bg-charcoal text-paper">
                  <span className="text-[8px] font-bold lowercase truncate">
                    designersstreet.com
                  </span>
                  <span className="text-[8px] opacity-70">×</span>
                </div>
                <div className="px-2 py-1.5 bg-paper">
                  <p
                    className="text-[11px] font-black uppercase tracking-tight leading-none"
                    style={{ color: palette.accent }}
                  >
                    Shop now →
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
