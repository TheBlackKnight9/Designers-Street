"use client";

import Image from "next/image";
import type { MediaRecord } from "@/server/types/media";

type PreviewProduct = {
  name: string;
  designerName: string;
  price: number;
  mrp?: number | null;
  description: string;
  category: string;
  sizes: string[];
  colors: string[];
  customizable?: boolean;
  deliveryText?: string | null;
  media: MediaRecord[];
};

export function ProductPreview({ product }: { product: PreviewProduct }) {
  const cover =
    product.media?.find((m) => m.type === "image")?.secureUrl ||
    product.media?.[0]?.thumbnailUrl ||
    product.media?.[0]?.secureUrl ||
    (product as any)?.images?.[0];

  return (
    <div className="rounded-2xl border border-cloud bg-mist/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-cloud/80">
        <p className="text-xs tracking-label uppercase text-stone">
          Customer preview
        </p>
      </div>
      <div className="relative aspect-[3/4] bg-cloud/40">
        {cover ? (
          <Image
            src={cover}
            alt={product.name || "Preview"}
            fill
            className="object-cover"
            sizes="400px"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-stone">
            Add a cover image
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs tracking-label uppercase text-stone">
          {product.designerName || "Your house"}
        </p>
        <h3 className="font-display text-xl leading-tight">
          {product.name || "Untitled product"}
        </h3>
        <p className="text-sm">
          ₹{product.price || 0}
          {product.mrp && product.mrp > product.price ? (
            <span className="ml-2 text-stone line-through">₹{product.mrp}</span>
          ) : null}
        </p>
        <p className="text-sm text-stone line-clamp-3">
          {product.description || "Description will appear here."}
        </p>
        {product.sizes.length > 0 && (
          <p className="text-xs text-stone">Sizes: {product.sizes.join(", ")}</p>
        )}
        {product.deliveryText && (
          <p className="text-xs text-stone">{product.deliveryText}</p>
        )}
        {product.customizable && (
          <p className="text-xs text-gold">Customization available</p>
        )}
      </div>
    </div>
  );
}
