"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  FEED_POSTS,
  formatPrice,
  getDesignerById,
  getProductsByDesigner,
} from "@/lib/mock-data";
import { useFollow } from "@/hooks/useSocial";
import { softHaptic } from "@/lib/media/haptics";
import { trackMediaEvent } from "@/lib/media/media-analytics";
import { getDesignerUrl } from "@/lib/routes";

type DesignerMiniSheetProps = {
  open: boolean;
  designerId?: string;
  initialFollowing?: boolean;
  onClose: () => void;
  onOpenFullProfile: (href: string) => void;
};

export function DesignerMiniSheet({
  open,
  designerId,
  initialFollowing,
  onClose,
  onOpenFullProfile,
}: DesignerMiniSheetProps) {
  const [mounted, setMounted] = useState(false);
  const designer = designerId ? getDesignerById(designerId) : undefined;

  const { following, toggle } = useFollow({
    designerId,
    initialFollowing,
  });

  const featured = useMemo(
    () => (designerId ? getProductsByDesigner(designerId).slice(0, 4) : []),
    [designerId]
  );

  const collections = useMemo(() => {
    if (!designerId) return [];
    const tags = FEED_POSTS.filter((p) => p.designerId === designerId)
      .map((p) => p.tag)
      .filter(Boolean) as string[];
    return [...new Set(tags)].slice(0, 4);
  }, [designerId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !designerId) return;
    trackMediaEvent("designer_profile_open", { designerId });
  }, [open, designerId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open || !designer || typeof document === "undefined") {
    return null;
  }

  const href = getDesignerUrl(designer.handle) ?? "/store";

  return createPortal(
    <div className="fixed inset-0 z-[85] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Close designer profile"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={designer.name}
        className="relative z-10 max-h-[75vh] rounded-t-3xl bg-[#FDFCF8] shadow-2xl overflow-hidden"
        style={{ animation: "ds-sheet-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span className="h-1 w-10 rounded-full bg-[#D0D0D0]" />
        </div>
        <div className="overflow-y-auto max-h-[calc(75vh-1.5rem)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-start gap-3 pt-2">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#E8E4DC] bg-white">
              <Image
                src={designer.logo}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="font-sans text-sm font-extrabold uppercase tracking-wide text-[#2B2B2B] truncate">
                  {designer.name}
                </h2>
                {designer.verified && (
                  <svg
                    className="h-3.5 w-3.5 text-[#2B2B2B] shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="font-sans text-[11px] text-[#7A7A7A] mt-0.5">
                {designer.location}
                {designer.followersCount
                  ? ` · ${designer.followersCount} followers`
                  : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                softHaptic(10);
                void toggle().catch(() => undefined);
                trackMediaEvent("follow", { designerId });
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 font-sans text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                following
                  ? "border border-[#2B2B2B]/30 text-[#2B2B2B]"
                  : "bg-[#2B2B2B] text-white"
              }`}
            >
              {following ? "✓ Following" : "+ Follow"}
            </button>
          </div>

          <p className="mt-3 font-sans text-xs leading-relaxed text-[#4A4A4A]">
            {designer.bio}
          </p>

          {collections.length > 0 && (
            <div className="mt-4">
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">
                Latest collections
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {collections.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-[#F0EDE6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#2B2B2B]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {featured.length > 0 && (
            <div className="mt-4">
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">
                Featured pieces
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {featured.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    onClick={() => onOpenFullProfile(`/product/${p.id}`)}
                    className="rounded-xl overflow-hidden bg-white border border-[#E8E4DC] active:scale-[0.98] transition-transform"
                  >
                    <div className="relative aspect-[3/4] bg-[#EEE]">
                      {p.images[0] ? (
                        <Image
                          src={p.images[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      ) : null}
                    </div>
                    <div className="p-2">
                      <p className="font-sans text-[11px] font-bold text-[#2B2B2B] line-clamp-1">
                        {p.name}
                      </p>
                      <p className="font-sans text-[10px] text-[#7A7A7A] mt-0.5">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => onOpenFullProfile(href)}
            className="mt-5 w-full h-11 rounded-full border border-[#2B2B2B]/20 font-sans text-[11px] font-extrabold uppercase tracking-wider text-[#2B2B2B]"
          >
            View full profile
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
