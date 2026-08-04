"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useOpenMediaViewer } from "@/context/MediaViewerContext";
import type { FeedPostData } from "@/lib/types";
import { feedPostToViewerMedia } from "@/lib/media";
import { formatPrice } from "@/lib/mock-data";
import { useFollow, useLike } from "@/hooks/useSocial";
import { ThumbUpIcon } from "@/components/icons/ThumbUpIcon";
import { ShareSheet } from "@/components/ShareSheet";
import { getDesignerUrl } from "@/lib/routes";
import { resolvePostProductId } from "@/lib/feed-product";

interface FeedPostProps {
  post: FeedPostData;
}

function isValidImageUrl(url?: string | null): boolean {
  if (!url || url === "na" || url.trim() === "") return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

export function FeedPost({ post }: FeedPostProps) {
  const { isWished, toggle: toggleWishlist } = useWishlist();
  const { addItem: addToCart, isInCart, quantityFor, openCart } = useCart();
  const { openMediaViewer } = useOpenMediaViewer();

  const {
    liked: isLiked,
    count: likesCount,
    toggle: toggleLike,
  } = useLike({
    targetId: post.id,
    initialLiked: post.likedByMe,
    initialCount: post.likesCount ?? 0,
    mode: "post",
  });
  const { following: isFollowing, toggle: toggleFollow } = useFollow({
    designerId: post.designerId,
    initialFollowing: post.followingDesigner,
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showTagPopover, setShowTagPopover] = useState(false);
  const [authHint, setAuthHint] = useState<string | null>(null);
  const lastTapRef = useRef(0);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commerceProductId = resolvePostProductId(post);
  const wished = commerceProductId ? isWished(commerceProductId) : false;
  const inBag = commerceProductId ? isInCart(commerceProductId) : false;
  const bagQty = commerceProductId ? quantityFor(commerceProductId) : 0;
  const designerHref = getDesignerUrl(post.designerId) ?? post.link;

  const handleLikeToggle = async () => {
    try {
      await toggleLike();
      if (!isLiked) {
        setShowHeartAnim(true);
        setTimeout(() => setShowHeartAnim(false), 800);
      }
    } catch {
      setAuthHint("Sign in to like");
    }
  };

  const handleDoubleTap = useCallback(() => {
    void (async () => {
      try {
        if (!isLiked) await toggleLike();
        setShowHeartAnim(true);
        setTimeout(() => setShowHeartAnim(false), 800);
      } catch {
        setAuthHint("Sign in to like");
      }
    })();
  }, [isLiked, toggleLike]);

  const handleImageTap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (singleTapTimer.current) {
        clearTimeout(singleTapTimer.current);
        singleTapTimer.current = null;
      }
      handleDoubleTap();
    } else {
      singleTapTimer.current = setTimeout(() => {
        const media = feedPostToViewerMedia(post);
        const videoIdx = media.findIndex((m) => m.type === "video");
        // Any post with a video enters continuous discovery on that video
        openMediaViewer({
          media,
          initialIndex: videoIdx >= 0 ? videoIdx : 0,
          continuous: videoIdx >= 0 ? true : undefined,
          source: "feed",
        });
        singleTapTimer.current = null;
      }, 280);
    }
    lastTapRef.current = now;
  };

  // Handle Quick Add to Cart — state derives from CartContext (no ephemeral toast)
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const pId = commerceProductId;
    if (!pId) return;
    const name = post.productTag?.name || post.caption.slice(0, 30);
    const price = post.productTag?.price || 78000;

    if (isInCart(pId)) {
      openCart();
      return;
    }

    addToCart({
      productId: pId,
      name: name,
      brand: post.designerName,
      price: price,
      size: "M",
      image: post.image,
    });
  };

  return (
    <article className="mb-4 bg-[#FDFCF8] rounded-2xl overflow-hidden neu-raised-sm border border-white/40">
      {/* Post Header — Instagram-style */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/40">
        <div className="flex items-center gap-3">
          <Link
            href={getDesignerUrl(post.designerId) ?? post.link}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden relative bg-[#D5DBE5] border border-white/50 flex-shrink-0 shadow-xs">
              {isValidImageUrl(post.designerLogo) ? (
                <Image
                  src={post.designerLogo}
                  alt={post.designerName}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-charcoal bg-mist">
                  {post.designerName?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-sans text-xs font-extrabold text-[#2B2B2B] uppercase tracking-wide group-hover:underline">
                  {post.designerName}
                </span>
                {post.designerVerified && (
                  <svg className="w-3.5 h-3.5 text-[#2B2B2B]" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Follow Tag / Button */}
        <div className="flex items-center gap-2">
          {post.tag && (
            <span className="px-2 py-0.5 bg-white/80 font-sans text-[9px] font-bold uppercase tracking-wider text-[#4A4A4A] rounded-full border border-gray-200">
              {post.tag}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              void toggleFollow().catch(() => setAuthHint("Sign in to follow"));
            }}
            className={`px-3 py-1 font-sans text-[10px] font-extrabold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
              isFollowing
                ? "bg-white text-[#2B2B2B] border border-gray-300"
                : "bg-[#2B2B2B] text-white shadow-xs"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      {/* Full-bleed Editorial Image / Vertical video */}
      <div
        className={`relative w-full bg-[#D5DBE5] group ${
          post.videoOnly ? "aspect-[9/16] max-h-[min(58vh,520px)] mx-auto" : "aspect-[4/5] max-h-[min(72vh,640px)]"
        }`}
      >
        <button
          type="button"
          onClick={handleImageTap}
          className="block w-full h-full relative cursor-zoom-in"
          aria-label={
            post.videoUrl || post.videoOnly
              ? "Play lookbook video"
              : "Open media viewer"
          }
        >
          {post.videoOnly && post.videoUrl ? (
            <video
              src={post.videoUrl}
              poster={isValidImageUrl(post.image) ? post.image : undefined}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
          ) : isValidImageUrl(post.image) ? (
            <Image
              src={post.image}
              alt={post.caption}
              fill
              className="object-cover pointer-events-none"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-sm text-stone bg-mist">
              No Preview Image Available
            </div>
          )}
          {(post.videoUrl || post.videoOnly) ? (
            <span className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white pointer-events-none">
              <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </span>
          ) : null}
        </button>

        {/* Product Tag Overlay (Interactive Pill on Image) */}
        {post.productTag && showTagPopover && (
          <div className="absolute bottom-14 left-4 z-20 animate-fade-in">
            <Link
              href={commerceProductId ? `/product/${commerceProductId}` : post.link}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md text-white rounded-full shadow-lg border border-white/30 hover:bg-black transition-all group/tag"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-sans text-[10px] font-bold tracking-wide">
                {post.productTag.name}
              </span>
              <span className="font-sans text-[10px] font-extrabold text-amber-300">
                • {formatPrice(post.productTag.price)}
              </span>
              <svg className="w-3 h-3 text-white/70 group-hover/tag:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        )}

        {/* Tag Toggle Button top right of image */}
        {post.productTag && (
          <button
            type="button"
            onClick={() => setShowTagPopover(!showTagPopover)}
            className="absolute top-3 right-3 z-20 p-2 bg-black/60 backdrop-blur-md rounded-full text-white cursor-pointer active:scale-95 transition-transform"
            aria-label={showTagPopover ? "Hide product tag" : "Show product tag"}
            aria-pressed={showTagPopover}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </button>
        )}

        {/* Double-tap heart animation overlay */}
        {showHeartAnim && (
          <div className="heart-overlay" style={{ animation: "heart-pop 0.8s cubic-bezier(0.17,0.89,0.32,1.28) forwards" }}>
            <ThumbUpIcon className="w-20 h-20 text-white drop-shadow-lg" filled />
          </div>
        )}

        {/* Actions overlay — always visible on media (tall videos won't hide controls) */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 px-3 py-2.5 bg-gradient-to-t from-black/80 via-black/45 to-transparent pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              type="button"
              onClick={() => void handleLikeToggle()}
              className="flex items-center gap-1 cursor-pointer active:scale-90 transition-transform"
              aria-label="Like post"
              aria-pressed={isLiked}
            >
              <ThumbUpIcon
                className="w-6 h-6 text-white"
                filled={isLiked}
                strokeWidth={2}
              />
              <span className="font-sans text-xs font-bold text-white tabular-nums">
                {likesCount}
              </span>
            </button>

            {commerceProductId && (
              <button
                type="button"
                onClick={() => toggleWishlist(commerceProductId)}
                className="cursor-pointer active:scale-90 transition-transform"
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wished}
              >
                <svg
                  className={`w-6 h-6 transition-colors ${
                    wished ? "fill-red-400 text-red-400" : "fill-none text-white"
                  }`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="cursor-pointer active:scale-90 transition-transform"
              aria-label="Share post"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </div>

          <div className="flex-1" />

          {commerceProductId ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#2B2B2B] rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span>
                {inBag
                  ? `In Bag${bagQty > 1 ? ` · ${bagQty}` : ""} ✓`
                  : "Add to Bag"}
              </span>
            </button>
          ) : designerHref ? (
            <Link
              href={designerHref}
              className="pointer-events-auto px-3 py-1.5 bg-white/15 border border-white/40 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm active:scale-95 transition-all"
            >
              View House
            </Link>
          ) : null}
        </div>
      </div>

      {authHint && (
        <p className="px-4 py-2 text-[10px] text-stone">
          {authHint}.{" "}
          <Link href="/account/login" className="underline">
            Sign in
          </Link>
        </p>
      )}

      {/* Caption & Designer handle */}
      <div className="px-4 py-3">
        <p className="font-sans text-xs text-[#2B2B2B] leading-relaxed">
          <Link
            href={getDesignerUrl(post.designerId) ?? post.link}
            className="font-extrabold uppercase tracking-wide hover:underline mr-1.5 text-black"
          >
            {post.designerName}
          </Link>
          <span className="text-[#4A4A4A] font-medium">{post.caption}</span>
        </p>
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={post.designerName}
        text={post.caption}
        url={post.link || "/feed"}
      />
    </article>
  );
}
