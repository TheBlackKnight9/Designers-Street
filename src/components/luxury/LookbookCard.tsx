"use client";

import Image from "next/image";
import Link from "next/link";
import type { LookbookData } from "@/lib/types";
import { getDesignerLookbookUrl } from "@/lib/routes";

type LookbookCardProps = {
  lookbook: LookbookData;
  designerHandle: string;
  className?: string;
};

export function LookbookCard({
  lookbook,
  designerHandle,
  className = "",
}: LookbookCardProps) {
  return (
    <Link
      href={getDesignerLookbookUrl(designerHandle, lookbook.slug) ?? "/store"}
      className={`group block overflow-hidden ${className}`}
    >
      <div className="relative aspect-[4/5] bg-[#F0F0F0] overflow-hidden">
        <Image
          src={lookbook.coverImage}
          alt={lookbook.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, 280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 font-sans text-[9px] font-bold uppercase tracking-widest text-white/90">
          {lookbook.kind}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-display text-sm font-bold text-white leading-tight">
            {lookbook.title}
          </h3>
          {lookbook.season ? (
            <p className="font-sans text-[10px] text-white/75 mt-0.5">
              {lookbook.season}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
