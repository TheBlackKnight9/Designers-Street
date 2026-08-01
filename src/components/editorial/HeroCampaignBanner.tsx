"use client";

import Image from "next/image";
import Link from "next/link";
import type { EditorialCampaignData } from "@/lib/types";
import { useOpenMediaViewer } from "@/context/MediaViewerContext";

type HeroCampaignBannerProps = {
  campaign: EditorialCampaignData;
  className?: string;
};

export function HeroCampaignBanner({
  campaign,
  className = "",
}: HeroCampaignBannerProps) {
  const { openMediaViewer } = useOpenMediaViewer();

  const handlePlayVideo = () => {
    if (!campaign.heroVideoUrl) return;
    openMediaViewer({
      media: [
        {
          id: campaign.id,
          type: "video",
          url: campaign.heroVideoUrl,
          thumbnailUrl: campaign.heroImage,
          caption: campaign.title,
          designerName: campaign.featuredDesignerName || "Maison Residency",
        },
      ],
      initialIndex: 0,
      continuous: false,
      source: "campaign-hero",
    });
  };

  return (
    <section className={`relative w-full aspect-[4/5] sm:aspect-[16/9] bg-[#E5E0D8] overflow-hidden ${className}`}>
      <Image
        src={campaign.heroImage}
        alt={campaign.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Top Badge */}
      {campaign.badge && (
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-xs font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#2B2B2B] shadow-sm">
            {campaign.badge}
          </span>
        </div>
      )}

      {/* Video Launcher */}
      {campaign.heroVideoUrl && (
        <button
          type="button"
          onClick={handlePlayVideo}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-xs rounded-full text-white font-sans text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-transform"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
          <span>Watch Campaign</span>
        </button>
      )}

      {/* Hero Body Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
        {campaign.subtitle && (
          <p className="font-sans text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">
            {campaign.subtitle}
          </p>
        )}
        <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight mb-2">
          {campaign.title}
        </h1>
        <p className="font-sans text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl mb-4 line-clamp-2">
          {campaign.headline || campaign.body}
        </p>

        <div className="flex items-center gap-3">
          <Link
            href={campaign.ctaLink || `/editorial/${campaign.slug}`}
            className="h-11 px-6 bg-white text-[#2B2B2B] font-sans text-xs font-extrabold uppercase tracking-wider rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center btn-press"
          >
            {campaign.ctaLabel || "Explore Campaign"}
          </Link>
        </div>
      </div>
    </section>
  );
}
