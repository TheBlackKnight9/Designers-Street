"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ViewerMediaItem } from "@/lib/media/types";
import { resolveShoppableReel } from "@/lib/media/shoppable";
import { softHaptic } from "@/lib/media/haptics";
import { trackMediaEvent } from "@/lib/media/media-analytics";
import { getDesignerUrl } from "@/lib/routes";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLike } from "@/hooks/useSocial";
import { ThumbUpIcon } from "@/components/icons/ThumbUpIcon";
import { ShareSheet } from "@/components/ShareSheet";
import { AnimatedCount } from "./AnimatedCount";

type ReelChromeProps = {
  item: ViewerMediaItem;
  onCloseViewer?: () => void;
};

/**
 * Minimal shoppable reel overlay — social rail + compact brand + buy actions.
 */
export function ReelChrome({ item: rawItem, onCloseViewer }: ReelChromeProps) {
  const item = useMemo(() => resolveShoppableReel(rawItem), [rawItem]);
  const productId = item.productId;
  const postId = item.postId;
  const likeTarget = postId || productId || item.id;
  const defaultSize = item.sizes?.[0] || "M";
  const { addItem, isInCart } = useCart();
  const { isWished, toggle: toggleWish } = useWishlist();

  const [shareOpen, setShareOpen] = useState(false);

  const {
    liked,
    count: likesCount,
    toggle: toggleLike,
  } = useLike({
    targetId: likeTarget,
    initialLiked: item.likedByMe,
    initialCount: item.likesCount ?? 0,
    mode: postId ? "post" : productId ? "product" : "auto",
  });

  const [heartBurst, setHeartBurst] = useState(false);
  const [savePulse, setSavePulse] = useState(false);
  const [authHint, setAuthHint] = useState<string | null>(null);

  useEffect(() => {
    setAuthHint(null);
    trackMediaEvent("reel_viewed", {
      mediaId: item.id,
      type: item.type,
      productId: item.productId,
      postId: item.postId,
      designerId: item.designerId,
    });
  }, [item.id, item.type, item.productId, item.postId, item.designerId]);

  const wished = productId ? isWished(productId) : false;
  const designerHref = getDesignerUrl(item.designerHandle ?? item.designerId);
  const productHref = productId ? `/product/${productId}` : null;
  const sharePath = productHref || designerHref || "/feed";

  const onLike = async () => {
    try {
      const wasLiked = liked;
      await toggleLike();
      softHaptic(wasLiked ? 6 : [8, 40, 12]);
      if (!wasLiked) {
        setHeartBurst(true);
        setTimeout(() => setHeartBurst(false), 700);
      }
    } catch (err) {
      setAuthHint(err instanceof Error ? err.message : "Could not update like");
    }
  };

  useEffect(() => {
    const handler = () => {
      void onLike();
    };
    window.addEventListener("ds-reel-double-like", handler);
    return () => window.removeEventListener("ds-reel-double-like", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liked, likeTarget]);

  const onSave = () => {
    if (!productId) {
      setAuthHint("Wishlist is available on product reels");
      return;
    }
    toggleWish(productId);
    softHaptic(10);
    setSavePulse(true);
    setTimeout(() => setSavePulse(false), 450);
    trackMediaEvent("wishlist", { productId, mediaId: item.id });
  };

  const cartLine = () => ({
    productId: productId!,
    name: item.productName || item.alt || "Piece",
    brand: item.designerName || "Designer",
    price: item.price || 0,
    size: defaultSize,
    image: item.productImage || item.thumbnailUrl || item.url,
  });

  const onBuyNow = () => {
    if (!productId) return;
    if (!isInCart(productId, defaultSize)) {
      addItem(cartLine(), { openDrawer: false });
    }
    trackMediaEvent("buy_now", { productId, mediaId: item.id });
    onCloseViewer?.();
    if (typeof window !== "undefined") {
      window.location.href = "/checkout";
    }
  };

  const goProduct = () => {
    if (!productHref) return;
    trackMediaEvent("product_opened", {
      productId,
      mediaId: item.id,
    });
    onCloseViewer?.();
    if (typeof window !== "undefined") {
      window.location.href = productHref;
    }
  };

  return (
    <>
      {/* Right social rail — like · wishlist · share */}
      <div className="pointer-events-auto absolute right-2.5 bottom-28 z-30 flex flex-col items-center gap-2.5">
        <ActionBtn
          label="Like"
          active={liked}
          count={likesCount}
          onClick={() => void onLike()}
          burst={heartBurst}
          small
        >
          <ThumbUpIcon
            className={`h-6 w-6 transition-transform duration-300 ${
              liked ? "text-white scale-110" : "text-white"
            }`}
            filled={liked}
            strokeWidth={2}
          />
        </ActionBtn>

        <ActionBtn
          label="Wishlist"
          active={wished}
          onClick={onSave}
          className={savePulse ? "ds-save-pop" : ""}
          small
        >
          <svg
            className={`h-5 w-5 transition-all duration-300 ${
              wished ? "fill-red-400 text-red-400 scale-110" : "fill-none text-white"
            } ${savePulse ? "scale-125" : ""}`}
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
        </ActionBtn>

        <ActionBtn
          label="Share"
          onClick={() => {
            softHaptic(8);
            trackMediaEvent("share", {
              mediaId: item.id,
              productId,
              postId,
            });
            setShareOpen(true);
          }}
          small
        >
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
            />
          </svg>
        </ActionBtn>
      </div>

      {/* Minimal bottom — brand + compact actions */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-6">
        {designerHref && (
          <Link
            href={designerHref}
            onClick={onCloseViewer}
            className="font-sans text-[11px] font-extrabold uppercase tracking-wide text-white hover:underline"
          >
            {item.designerName || "Designer"}
          </Link>
        )}

        {productId && (
          <div className="mt-2 flex gap-1.5 max-w-[220px]">
            <button
              type="button"
              onClick={onBuyNow}
              className="h-8 flex-1 rounded-full bg-white text-[#2B2B2B] font-sans text-[9px] font-extrabold uppercase tracking-wider active:scale-[0.97] transition-transform"
            >
              Buy Now
            </button>
            {productHref && (
              <button
                type="button"
                onClick={goProduct}
                className="h-8 flex-1 rounded-full border border-white/50 text-white font-sans text-[9px] font-extrabold uppercase tracking-wider active:scale-[0.97] transition-transform backdrop-blur-sm"
              >
                View Product
              </button>
            )}
          </div>
        )}

        {!productId && designerHref && (
          <Link
            href={designerHref}
            onClick={onCloseViewer}
            className="mt-2 inline-flex h-8 items-center px-3 rounded-full border border-white/50 text-white font-sans text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-sm"
          >
            View House
          </Link>
        )}

        {authHint && (
          <p className="mt-1.5 text-[9px] text-white/75">
            {authHint}
            {authHint.toLowerCase().includes("sign in") ? (
              <>
                .{" "}
                <Link
                  href="/account/login"
                  className="underline"
                  onClick={onCloseViewer}
                >
                  Sign in
                </Link>
              </>
            ) : null}
          </p>
        )}
      </div>

      {heartBurst && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <ThumbUpIcon className="h-20 w-20 text-white drop-shadow-lg animate-[heart-pop_0.7s_ease-out_forwards]" filled />
        </div>
      )}

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={item.productName || item.designerName || "Designer's Street"}
        text={item.caption || item.productDescription}
        url={sharePath}
      />
    </>
  );
}

function ActionBtn({
  children,
  label,
  count,
  onClick,
  active,
  className = "",
  burst,
  small,
}: {
  children: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
  active?: boolean;
  className?: string;
  burst?: boolean;
  small?: boolean;
}) {
  const shell = small ? "h-9 w-9" : "h-11 w-11";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex flex-col items-center gap-0.5 active:scale-90 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      aria-label={label}
      aria-pressed={active}
    >
      <span
        className={`flex ${shell} items-center justify-center rounded-full bg-black/35 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.25)] ${
          burst ? "ds-rail-burst" : ""
        }`}
      >
        {children}
      </span>
      {typeof count === "number" && <AnimatedCount value={count} />}
    </button>
  );
}
