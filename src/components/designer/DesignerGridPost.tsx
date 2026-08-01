"use client";

import Image from "next/image";
import type { FeedPostData, Product } from "@/lib/types";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useOpenMediaViewer } from "@/context/MediaViewerContext";
import { feedPostToViewerMedia } from "@/lib/media";
import { useLike } from "@/hooks/useSocial";
import { ShareButton } from "@/components/ShareButton";
import { getDesignerUrl } from "@/lib/routes";

type Props = {
  post: FeedPostData;
  designerName: string;
  designerHandle?: string;
  shopProduct?: Product | null;
};

export function DesignerGridPost({ post, designerName, designerHandle, shopProduct }: Props) {
  const { isWished, toggle: toggleWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { openMediaViewer } = useOpenMediaViewer();
  const { liked, count, toggle } = useLike({
    targetId: post.id,
    initialLiked: post.likedByMe,
    initialCount: post.likesCount ?? 0,
  });

  const saveId = post.productTag?.productId || shopProduct?.id;

  return (
    <div className="flex flex-col bg-[#FDFCF8] rounded-2xl overflow-hidden neu-raised-sm border border-white/40 group">
      <div className="relative aspect-[4/5] w-full bg-[#D5DBE5]">
        <button
          type="button"
          className="absolute inset-0 block w-full h-full cursor-zoom-in"
          onClick={() => {
            const media = feedPostToViewerMedia(post);
            const videoIdx = media.findIndex((m) => m.type === "video");
            openMediaViewer({
              media,
              initialIndex: videoIdx >= 0 ? videoIdx : 0,
              continuous: videoIdx >= 0 ? true : undefined,
              source: "designer-profile",
            });
          }}
          aria-label="Open media viewer"
        >
          <Image
            src={post.image}
            alt={post.caption}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-103 pointer-events-none"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        </button>
        {post.tag && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/70 backdrop-blur-md text-white rounded-full pointer-events-none">
            <span className="font-sans text-[8px] font-bold uppercase tracking-wider">
              {post.tag}
            </span>
          </div>
        )}
      </div>

      <div className="px-3 py-2 flex items-center justify-between bg-white/50 border-t border-white/40">
        <button
          type="button"
          onClick={() => void toggle().catch(() => undefined)}
          className="flex items-center gap-1 text-[#2B2B2B] active:scale-90 transition-transform cursor-pointer"
          aria-label="Like post"
          aria-pressed={liked}
        >
          <svg
            className={`w-4 h-4 transition-colors ${
              liked ? "fill-red-500 text-red-500" : "fill-none text-[#2B2B2B]"
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span className="font-sans text-[10px] font-bold">{count}</span>
        </button>

        <div className="flex items-center gap-2">
          {saveId && (
            <button
              type="button"
              onClick={() => toggleWishlist(saveId)}
              className="text-[#2B2B2B] active:scale-90 transition-transform cursor-pointer"
              aria-label="Wishlist"
              aria-pressed={isWished(saveId)}
            >
              <svg
                className={`w-4 h-4 transition-colors ${
                  isWished(saveId)
                    ? "fill-[#2B2B2B] text-[#2B2B2B]"
                    : "fill-none text-[#2B2B2B]"
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                />
              </svg>
            </button>
          )}
          <ShareButton
            title={designerName}
            text={post.caption}
            path={
              post.link ||
              getDesignerUrl(designerHandle ?? post.designerId) ||
              "/"
            }
            className="font-sans text-[9px] font-bold uppercase tracking-wider text-[#2B2B2B]"
            label="Share"
          />
          {shopProduct && (
            <button
              type="button"
              onClick={() =>
                addToCart({
                  productId: shopProduct.id,
                  name: shopProduct.name,
                  brand: designerName,
                  price: shopProduct.price,
                  size: shopProduct.sizes[0] || "M",
                  image: shopProduct.images[0] || post.image,
                })
              }
              className="text-[#2B2B2B] active:scale-90 transition-transform cursor-pointer p-1 rounded-full hover:bg-white"
              aria-label="Add to cart"
            >
              <svg
                className="w-4 h-4 text-[#2B2B2B]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
