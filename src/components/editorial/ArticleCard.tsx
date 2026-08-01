"use client";

import Image from "next/image";
import Link from "next/link";
import type { EditorialArticleData } from "@/lib/types";

type ArticleCardProps = {
  article: EditorialArticleData;
  className?: string;
};

export function ArticleCard({ article, className = "" }: ArticleCardProps) {
  return (
    <Link
      href={`/editorial/${article.slug}`}
      className={`group block overflow-hidden rounded-xl bg-white border border-[#E8E4DC] shadow-2xs ${className}`}
    >
      <div className="relative w-full aspect-[16/10] bg-[#E5E0D8] overflow-hidden">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 400px"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs font-sans text-[9px] font-extrabold uppercase tracking-widest text-[#2B2B2B]">
          {article.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-base font-bold text-[#2B2B2B] leading-snug group-hover:text-black transition-colors mb-1.5">
          {article.title}
        </h3>
        <p className="font-sans text-xs text-[#7A7A7A] leading-relaxed line-clamp-2 mb-3">
          {article.excerpt}
        </p>

        {article.authorName && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#F0ECE4] text-[10px] font-sans font-semibold text-[#A0A0A0]">
            <span>By {article.authorName}</span>
            {article.authorRole && <span>· {article.authorRole}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
