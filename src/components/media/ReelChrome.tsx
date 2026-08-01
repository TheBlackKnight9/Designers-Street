"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ViewerMediaItem } from "@/lib/media/types";
import { resolveShoppableReel } from "@/lib/media/shoppable";
import { softHaptic } from "@/lib/media/haptics";
import { trackMediaEvent } from "@/lib/media/media-analytics";
import { getDesignerUrl } from "@/lib/routes";
import { formatPrice } from "@/lib/mock-data";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useFollow, useLike } from "@/hooks/useSocial";
import { useShare } from "@/hooks/useShare";
import { CommentSheet } from "./CommentSheet";
import { FloatingProductCard } from "./FloatingProductCard";
import { ReelQuickCart, type QuickCartPayload } from "./ReelQuickCart";
import { DesignerMiniSheet } from "./DesignerMiniSheet";
import { AnimatedCount } from "./AnimatedCount";

type ReelChromeProps = {
  item: ViewerMediaItem;
  onCloseViewer?: () => void;
};

/**
 * Premium shoppable reel overlay — social rail, floating product card,
 * variants, trust signals, quick cart, designer mini profile.
 */
export function ReelChrome({ item: rawItem, onCloseViewer }: ReelChromeProps) {
  const item = useMemo(() => resolveShoppableReel(rawItem), [rawItem]);
  const productId = item.productId;
  const postId = item.postId;
  const likeTarget = postId || productId || item.id;
  const { addItem, isInCart, openCart, quantityFor, total } = useCart();
  const { isWished, toggle: toggleWish } = useWishlist();
  const { share, copied } = useShare();

  const {
    liked,
    count: likesCount,
    toggle: toggleLike,
  } = useLike({
    targetId: likeTarget,
    initialLiked: item.likedByMe,
    initialCount: item.likesCount ?? 0,
    mode: postId ? "auto" : productId ? "product" : "auto",
  });

  const { following, toggle: toggleFollow } = useFollow({
    designerId: item.designerId,
    initialFollowing: item.followingDesigner,
  });

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(item.commentsCount ?? 0);
  const [heartBurst, setHeartBurst] = useState(false);
  const [savePulse, setSavePulse] = useState(false);
  const [followPulse, setFollowPulse] = useState(false);
  const [size, setSize] = useState(item.sizes?.[0] || "M");
  const [color, setColor] = useState(item.colors?.[0] || "");
  const [authHint, setAuthHint] = useState<string | null>(null);
  const [quickCart, setQuickCart] = useState<QuickCartPayload | null>(null);
  const [designerOpen, setDesignerOpen] = useState(false);

  useEffect(() => {
    setCommentsCount(item.commentsCount ?? 0);
    setSize(item.sizes?.[0] || "M");
    setColor(item.colors?.[0] || "");
    setCommentsOpen(false);
    setAuthHint(null);
    setDesignerOpen(false);
    trackMediaEvent("reel_viewed", {
      mediaId: item.id,
      type: item.type,
      productId: item.productId,
      postId: item.postId,
      designerId: item.designerId,
    });
  }, [item.id, item.commentsCount, item.sizes, item.colors, item.type, item.productId, item.postId, item.designerId]);

  const inBag = productId ? isInCart(productId, size) : false;
  const bagQty = productId ? quantityFor(productId, size) : 0;
  const wished = productId ? isWished(productId) : false;
  // getDesignerUrl resolves handle first, falls back to id, never uses display name.
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

  const onComment = () => {
    if (postId) {
      setCommentsOpen(true);
      trackMediaEvent("comment", { postId, mediaId: item.id });
      return;
    }
    setAuthHint("Comments aren’t available for this look yet");
  };

  const onSave = () => {
    if (!productId) {
      setAuthHint("Save is available on product reels");
      return;
    }
    toggleWish(productId);
    softHaptic(10);
    setSavePulse(true);
    setTimeout(() => setSavePulse(false), 450);
    trackMediaEvent("wishlist", { productId, mediaId: item.id });
  };

  const onFollow = async () => {
    try {
      await toggleFollow();
      softHaptic(10);
      setFollowPulse(true);
      setTimeout(() => setFollowPulse(false), 400);
      trackMediaEvent("follow", {
        designerId: item.designerId,
        mediaId: item.id,
      });
    } catch (err) {
      setAuthHint(err instanceof Error ? err.message : "Could not update follow");
    }
  };

  const cartLine = () => ({
    productId: productId!,
    name: item.productName || item.alt || "Piece",
    brand: item.designerName || "Designer",
    price: item.price || 0,
    size,
    image: item.productImage || item.thumbnailUrl || item.url,
  });

  const onAddToBag = () => {
    if (!productId) return;
    if (isInCart(productId, size)) {
      openCart();
      return;
    }
    addItem(cartLine(), { openDrawer: false });
    softHaptic([10, 30, 10]);
    trackMediaEvent("add_to_bag", {
      productId,
      mediaId: item.id,
      value: size,
    });
    const nextQty = quantityFor(productId, size) + 1;
    setQuickCart({
      name: item.productName || item.alt || "Piece",
      brand: item.designerName || "Designer",
      price: item.price || 0,
      size,
      image: item.productImage || item.thumbnailUrl || item.url,
      quantity: nextQty,
      subtotal: total + (item.price || 0),
    });
  };

  const onBuyNow = () => {
    if (!productId) return;
    if (!isInCart(productId, size)) {
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
      {/* Right social rail */}
      <div className="pointer-events-auto absolute right-3 bottom-40 z-30 flex flex-col items-center gap-3.5">
        <ActionBtn
          label="Like"
          active={liked}
          count={likesCount}
          onClick={() => void onLike()}
          burst={heartBurst}
        >
          <svg
            className={`h-7 w-7 transition-transform duration-300 ${
              liked ? "fill-red-500 text-red-500 scale-110" : "fill-none text-white"
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
        </ActionBtn>

        <ActionBtn label="Comment" count={commentsCount} onClick={onComment}>
          <svg
            className="h-7 w-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </ActionBtn>

        <ActionBtn
          label={copied ? "Copied" : "Share"}
          onClick={() => {
            softHaptic(8);
            trackMediaEvent("share", {
              mediaId: item.id,
              productId,
              postId,
            });
            void share({
              title:
                item.productName || item.designerName || "Designer's Street",
              text: item.caption || item.productDescription,
              url: sharePath,
            });
          }}
        >
          <svg
            className="h-7 w-7 text-white"
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

        <ActionBtn
          label="Save"
          active={wished}
          onClick={onSave}
          className={savePulse ? "ds-save-pop" : ""}
        >
          <svg
            className={`h-7 w-7 transition-all duration-300 ${
              wished ? "fill-white text-white scale-110" : "fill-none text-white"
            } ${savePulse ? "scale-125" : ""}`}
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
        </ActionBtn>
      </div>

      {/* Bottom info + commerce */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-20">
        <FloatingProductCard item={item} onOpenProduct={goProduct} />

        <div className="flex items-center gap-2.5 mb-2.5 max-w-[78%]">
          <button
            type="button"
            className="relative h-9 w-9 overflow-hidden rounded-full border border-white/40 bg-white/10 shrink-0 active:scale-95 transition-transform"
            onClick={() => item.designerId && setDesignerOpen(true)}
            aria-label="Designer profile"
          >
            {item.designerLogo ? (
              <Image
                src={item.designerLogo}
                alt=""
                fill
                className="object-cover"
                sizes="36px"
              />
            ) : null}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="font-sans text-xs font-extrabold uppercase tracking-wide text-white truncate hover:underline text-left"
                onClick={() => item.designerId && setDesignerOpen(true)}
              >
                {item.designerName || "Designer"}
              </button>
              {item.designerVerified && (
                <svg
                  className="h-3.5 w-3.5 text-white shrink-0"
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
            {item.designerFollowers && (
              <p className="font-sans text-[9px] text-white/60 mt-0.5">
                {item.designerFollowers} followers
              </p>
            )}
          </div>
          {item.designerId && (
            <button
              type="button"
              onClick={() => void onFollow()}
              className={`shrink-0 rounded-full px-3 py-1 font-sans text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                followPulse ? "scale-105" : "scale-100"
              } ${
                following
                  ? "border border-white/50 text-white"
                  : "bg-white text-[#2B2B2B]"
              }`}
            >
              {following ? "✓ Following" : "+ Follow"}
            </button>
          )}
        </div>

        {productId && (
          <div className="max-w-[78%] mb-3 space-y-2">
            {item.sizes && item.sizes.length > 0 && (
              <div>
                <p className="font-sans text-[9px] font-bold uppercase tracking-wider text-white/55 mb-1">
                  Size
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.sizes.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSize(s);
                        softHaptic(6);
                        trackMediaEvent("size_selected", {
                          productId,
                          value: s,
                        });
                      }}
                      className={`min-w-[2rem] rounded-md px-2 py-1 text-[10px] font-bold transition-all duration-200 ${
                        size === s
                          ? "bg-white text-[#2B2B2B] shadow-sm"
                          : "bg-white/15 text-white hover:bg-white/25"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {item.colors && item.colors.length > 0 && (
              <div>
                <p className="font-sans text-[9px] font-bold uppercase tracking-wider text-white/55 mb-1">
                  Color
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.colors.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => {
                        setColor(c);
                        softHaptic(6);
                        trackMediaEvent("color_selected", {
                          productId,
                          value: c,
                        });
                      }}
                      className={`h-6 w-6 rounded-full border-2 transition-transform duration-200 ${
                        color === c
                          ? "border-white scale-110 shadow-[0_0_0_2px_rgba(0,0,0,0.35)]"
                          : "border-white/35"
                      }`}
                      style={{ background: c }}
                      aria-label={`Color ${c}`}
                      aria-pressed={color === c}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Trust signals */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {item.deliveryText && (
                <TrustChip>Delivery · {item.deliveryText.replace(/^Delivery\s+/i, "")}</TrustChip>
              )}
              <TrustChip>Easy returns</TrustChip>
              <TrustChip>Authentic designer</TrustChip>
              {item.limitedEdition && <TrustChip>Limited edition</TrustChip>}
            </div>
          </div>
        )}

        {productId && (
          <div className="flex gap-2 max-w-md">
            <button
              type="button"
              onClick={onAddToBag}
              className={`flex-1 h-11 rounded-full font-sans text-[11px] font-extrabold uppercase tracking-wider transition-all duration-300 active:scale-[0.97] shadow-[0_4px_20px_rgba(0,0,0,0.25)] ${
                inBag
                  ? "bg-white text-[#2B2B2B]"
                  : "bg-[#2B2B2B] text-white border border-white/20"
              }`}
            >
              {inBag
                ? `In Bag${bagQty > 1 ? ` · ${bagQty}` : ""} ✓`
                : "Add to Bag"}
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              className="h-11 px-4 rounded-full bg-white/15 border border-white/40 text-white font-sans text-[11px] font-extrabold uppercase tracking-wider active:scale-[0.97] transition-transform backdrop-blur-sm"
            >
              Buy Now
            </button>
            {productHref && (
              <button
                type="button"
                onClick={goProduct}
                className="h-11 px-3 flex items-center rounded-full border border-white/40 text-white font-sans text-[10px] font-bold uppercase tracking-wider whitespace-nowrap active:scale-[0.97] transition-transform backdrop-blur-sm"
              >
                View Product
              </button>
            )}
          </div>
        )}

        {authHint && (
          <p className="mt-2 text-[10px] text-white/70">
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
          <svg
            className="h-24 w-24 text-white drop-shadow-lg animate-[heart-pop_0.7s_ease-out_forwards]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
      )}

      {postId && (
        <CommentSheet
          open={commentsOpen}
          postId={postId}
          designerName={item.designerName}
          designerHandle={item.designerHandle}
          onClose={() => setCommentsOpen(false)}
          onCountChange={setCommentsCount}
        />
      )}

      <ReelQuickCart
        open={Boolean(quickCart)}
        payload={quickCart}
        onClose={() => setQuickCart(null)}
        onCheckout={() => {
          setQuickCart(null);
          onCloseViewer?.();
          if (typeof window !== "undefined") {
            window.location.href = "/checkout";
          }
        }}
      />

      <DesignerMiniSheet
        open={designerOpen}
        designerId={item.designerId}
        initialFollowing={following}
        onClose={() => setDesignerOpen(false)}
        onOpenFullProfile={(href) => {
          setDesignerOpen(false);
          onCloseViewer?.();
          if (typeof window !== "undefined") {
            window.location.href = href;
          }
        }}
      />
    </>
  );
}

function TrustChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
      {children}
    </span>
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
}: {
  children: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
  active?: boolean;
  className?: string;
  burst?: boolean;
}) {
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
        className={`flex h-11 w-11 items-center justify-center rounded-full bg-black/35 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.25)] ${
          burst ? "ds-rail-burst" : ""
        }`}
      >
        {children}
      </span>
      {typeof count === "number" && <AnimatedCount value={count} />}
    </button>
  );
}
