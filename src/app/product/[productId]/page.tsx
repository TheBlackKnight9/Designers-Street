"use client";

import { use, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { ProductCard } from "@/components/ui/ProductCard";
import { CatalogStatus } from "@/components/ui/CatalogStatus";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useOpenMediaViewer } from "@/context/MediaViewerContext";
import { productToViewerMedia } from "@/lib/media";
import { DESIGNERS, PRODUCTS, formatPrice } from "@/lib/mock-data";
import {
  useStorefrontProduct,
  useStorefrontProducts,
  useStorefrontDesigners,
} from "@/hooks/useStorefrontCatalog";
import { useLike } from "@/hooks/useSocial";
import { ShareButton } from "@/components/ShareButton";
import { LuxuryBadges } from "@/components/luxury/LuxuryBadges";
import { ScarcityStrip } from "@/components/luxury/ScarcityStrip";
import { EditionBadge } from "@/components/luxury/EditionBadge";
import { TrustSignals } from "@/components/luxury/TrustSignals";
import { APlusContentRenderer } from "@/components/product/APlusContentRenderer";
import { ProductReviews } from "@/components/product/ProductReviews";
import { useRouter } from "next/navigation";
import { SizeRecommendation } from "@/components/product/SizeRecommendation";
import { ConceptInterestModal } from "@/components/product/ConceptInterestModal";
import { ProductStickyActions } from "@/components/product/ProductStickyActions";
import { getEditionInfo } from "@/lib/luxury";
import { getDesignerUrl } from "@/lib/routes";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { productId } = use(params);
  const router = useRouter();
  const catalogProduct = useStorefrontProduct(productId);
  const catalogList = useStorefrontProducts({ limit: 24 });
  const catalogDesigners = useStorefrontDesigners();
  const { addItem, isInCart, quantityFor, openCart } = useCart();
  const { isWished, toggle } = useWishlist();
  const { openMediaViewer } = useOpenMediaViewer();

  const products = catalogList.enabled ? catalogList.products : PRODUCTS;
  const designers = catalogDesigners.enabled
    ? catalogDesigners.designers
    : DESIGNERS;
  const product = catalogProduct.enabled
    ? catalogProduct.product
    : PRODUCTS.find((p) => p.id === productId) ?? null;
  const designer = product
    ? designers.find((d) => d.id === product.designerId || d.name === product.designerName) ?? null
    : null;

  const {
    liked: productLiked,
    count: productLikes,
    toggle: toggleProductLike,
  } = useLike({
    targetId: productId,
    initialCount: 0,
    mode: "product",
  });

  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("story");
  const [error, setError] = useState("");
  const [likeHint, setLikeHint] = useState<string | null>(null);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const openGallery = useCallback(
    (index: number) => {
      if (!product) return;
      const media = productToViewerMedia(product);
      if (!media.length) return;
      openMediaViewer({
        media,
        initialIndex: index,
        syncUrl: true,
        continuous: false,
        source: "product-detail",
      });
    },
    [openMediaViewer, product]
  );

  const openLookbook = useCallback(() => {
    if (!product) return;
    const media = productToViewerMedia(product);
    const firstVideo = media.findIndex((m) => m.type === "video");
    if (firstVideo < 0) return;
    openMediaViewer({
      media,
      initialIndex: firstVideo,
      continuous: true,
      source: "product-detail-video",
    });
  }, [openMediaViewer, product]);

  // Restore viewer from ?media=N on refresh
  useEffect(() => {
    if (!product?.images?.length) return;
    const raw = new URLSearchParams(window.location.search).get("media");
    if (raw == null) return;
    const i = Number(raw);
    if (!Number.isFinite(i) || i < 0 || i >= product.images.length) return;
    setActiveImage(i);
    openGallery(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (catalogProduct.enabled && catalogProduct.loading) {
    return (
      <>
        <TopBar />
        <CatalogStatus loading skeletonCount={1} />
      </>
    );
  }

  if (catalogProduct.enabled && catalogProduct.error) {
    return (
      <>
        <TopBar />
        <CatalogStatus error={catalogProduct.error} onRetry={catalogProduct.reload} />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase mb-3">
              Piece Not Found
            </h1>
            <p className="font-sans text-sm text-[#7A7A7A] mb-6">
              This collection piece may have sold out or been removed.
            </p>
            <Link href="/" className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] underline">
              Return Home
            </Link>
          </div>
        </main>
      </>
    );
  }

  const wished = isWished(product.id);
  const inBag = isInCart(product.id);
  const bagQty = quantityFor(product.id);

  const recommendations = products.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.designerId === product.designerId)
  ).slice(0, 4);

  const handleAddToBag = () => {
    if (!selectedSize) {
      setError("Please select a size");
      return;
    }
    setError("");
    if (isInCart(product.id)) {
      openCart();
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.designerName,
      price: product.price,
      size: selectedSize,
      image: product.images[0],
    });
  };

  const handleBuyNow = () => {
    const sizeToUse = selectedSize || product.sizes[0] || "M";
    if (!isInCart(product.id)) {
      addItem({
        productId: product.id,
        name: product.name,
        brand: product.designerName,
        price: product.price,
        size: sizeToUse,
        image: product.images[0],
      });
    }
    router.push("/checkout");
  };

  const toggleSection = (s: string) => setOpenSection(openSection === s ? null : s);

  const isConcept = (product as { listingType?: string }).listingType === "CONCEPT_ART";
  const conceptLabel =
    (product as { conceptCta?: string }).conceptCta === "EXPRESS_INTEREST"
      ? "Express Interest"
      : (product as { conceptCta?: string }).conceptCta === "PRE_ORDER_DEPOSIT"
        ? "Pre-Order Sample"
        : "Request Bespoke Quote";
  const rating = product.rating ?? 4.5;

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-10 bg-paper">
        <div className="px-4 pt-2 max-w-3xl mx-auto">
          {/* Sticky primary commerce actions — always visible while scrolling */}
          <ProductStickyActions
            isConcept={isConcept}
            conceptLabel={conceptLabel}
            inBag={inBag}
            bagQty={bagQty}
            error={error}
            onAddToBag={handleAddToBag}
            onBuyNow={handleBuyNow}
            onConcept={() => setShowConceptModal(true)}
          />

          {/* Product toolbar */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-charcoal active:scale-95"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggle(product.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                  wished ? "bg-charcoal border-charcoal text-paper" : "bg-paper border-cloud text-charcoal"
                }`}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wished}
              >
                <svg
                  className={`h-5 w-5 ${wished ? "fill-current" : "fill-none"}`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </button>
              <ShareButton
                title={product.name}
                text={`${product.designerName} — ${product.name}`}
                path={`/product/${product.id}`}
                label="⋯"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cloud bg-paper text-charcoal text-lg leading-none"
              />
            </div>
          </div>

          {/* Gallery — main image + side thumbnails */}
          <div className="flex gap-2.5 mb-5">
            <button
              type="button"
              className="relative flex-1 aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-mist cursor-zoom-in"
              onClick={() => openGallery(activeImage)}
              aria-label="Open media viewer"
            >
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover pointer-events-none"
                priority
                sizes="(max-width: 768px) 75vw, 480px"
              />
              {product.videos && product.videos.length > 0 ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    openLookbook();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      openLookbook();
                    }
                  }}
                  className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1.5 text-white backdrop-blur-sm"
                  aria-label="Play lookbook video"
                >
                  <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                  <span className="font-sans text-[9px] font-bold uppercase tracking-wider">Lookbook</span>
                </span>
              ) : null}
              {(product.limitedEdition || product.piecesRemaining != null) && (
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full pointer-events-none">
                  <span className="limited-badge text-charcoal text-[9px]">
                    {getEditionInfo(product)?.label ||
                      (product.piecesRemaining != null
                        ? `Limited — ${product.piecesRemaining} left`
                        : "Limited Release")}
                  </span>
                </div>
              )}
            </button>

            {product.images.length > 1 && (
              <div className="flex w-[72px] flex-col gap-2 overflow-y-auto max-h-[min(68vw,420px)] hide-scrollbar">
                {product.images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-[3/4] w-full flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                      i === activeImage ? "border-charcoal opacity-100" : "border-transparent opacity-75"
                    }`}
                    aria-label={`Show image ${i + 1}`}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="72px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + price */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-sans text-[1.35rem] font-extrabold text-charcoal leading-tight tracking-tight flex-1">
                {product.name}
              </h1>
              <span className="font-sans text-[1.35rem] font-extrabold text-charcoal whitespace-nowrap">
                {formatPrice(product.price)}
              </span>
            </div>
            <Link
              href={getDesignerUrl(designer?.handle) ?? "#"}
              className="mt-1 inline-block font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-stone"
            >
              {product.designerName}
            </Link>

            {isConcept && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-900 font-sans text-xs font-bold uppercase tracking-wider">
                Concept Showcase
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-sm font-extrabold text-charcoal">{rating.toFixed(1)}</span>
                <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "text-[var(--newme-green-dark)]" : "text-cloud"}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              {!isConcept && (
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("product-size-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="px-4 py-2 rounded-full bg-charcoal text-paper font-sans text-[11px] font-extrabold uppercase tracking-wider active:scale-95"
                >
                  {selectedSize ? `Size ${selectedSize}` : "Select size"}
                </button>
              )}
            </div>

            <div className="flex items-baseline gap-2.5 mt-3 flex-wrap">
              <span className="font-sans text-xs text-stone line-through">
                MRP {formatPrice(product.mrp || Math.round(product.price * 1.15))}
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-sans text-[10px] font-extrabold uppercase tracking-wider">
                {Math.round(
                  (((product.mrp || Math.round(product.price * 1.15)) - product.price) /
                    (product.mrp || Math.round(product.price * 1.15))) *
                    100
                )}
                % OFF
              </span>
              {!isConcept && (
                <span className="px-2.5 py-0.5 bg-emerald-700 text-white rounded font-sans text-[9px] font-extrabold uppercase tracking-wider">
                  Free Shipping
                </span>
              )}
            </div>

            <LuxuryBadges
              product={product}
              designerVerified={designer?.verified}
              className="mt-3"
            />
            <ScarcityStrip product={product} className="mt-3" />
            <EditionBadge product={product} className="mt-3" />

            {product.bestPrice && (
              <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-900 font-sans text-xs font-bold shadow-2xs">
                <span>Best Offer Price:</span>
                <span className="font-extrabold text-emerald-800">{formatPrice(product.bestPrice)}</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <SizeRecommendation selectedSize={selectedSize} onSelectSize={setSelectedSize} />
          </div>

          {/* Sizes */}
          <div id="product-size-section" className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                Select Size
              </span>
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal underline"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size);
                    setError("");
                  }}
                  className={`h-10 min-w-[44px] px-3 border text-xs font-semibold rounded-full transition-all ${
                    selectedSize === size
                      ? "border-charcoal bg-charcoal text-paper"
                      : "border-cloud text-charcoal"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <button
              type="button"
              onClick={() =>
                void toggleProductLike().catch(() =>
                  setLikeHint("Sign in to like this piece")
                )
              }
              className="flex items-center gap-1.5 font-sans text-xs font-semibold text-charcoal"
              aria-pressed={productLiked}
              aria-label="Like product"
            >
              <svg
                className={`h-5 w-5 ${
                  productLiked ? "fill-red-500 text-red-500" : "fill-none text-charcoal"
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {productLikes > 0 ? productLikes : "Like"}
            </button>
          </div>
          {likeHint && (
            <p className="mb-4 text-[10px] text-stone">
              {likeHint}.{" "}
              <Link href="/account/login" className="underline">
                Sign in
              </Link>
            </p>
          )}

          {product.customizable && (
            <Link
              href={`/bespoke?productId=${encodeURIComponent(product.id)}&designerId=${encodeURIComponent(product.designerId)}`}
              className="flex items-center justify-center h-12 border border-charcoal text-charcoal font-sans text-xs font-semibold uppercase tracking-wider rounded-full btn-press mb-5"
            >
              Customize This Piece
            </Link>
          )}

          <TrustSignals
            deliveryText={product.deliveryText}
            verifiedDesigner={Boolean(designer?.verified || product.verified)}
            className="mb-4"
          />

          <div className="flex items-center gap-2 mb-6 py-3 border-b border-[#EBEBEB]">
            <svg className="w-4 h-4 text-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span className="font-sans text-xs text-stone">
              Need help?{" "}
              <Link
                href={getDesignerUrl(designer?.handle) ?? "/bespoke"}
                className="font-semibold text-charcoal underline"
              >
                Speak to a stylist
              </Link>
            </span>
          </div>

          {/* Accordion Sections */}
          <div className="space-y-0">
            <div className="border-b border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => toggleSection("story")}
                className="flex w-full items-center justify-between py-4 font-sans text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                <span>The Story</span>
                <span className="text-sm">{openSection === "story" ? "−" : "+"}</span>
              </button>
              {openSection === "story" && (
                <div className="pb-4 font-sans text-xs text-[#4A4A4A] leading-relaxed space-y-2">
                  <p>{product.description}</p>
                  {product.story && <p className="italic text-stone">{product.story}</p>}
                  {product.designerInspiration && (
                    <p>
                      <strong className="text-charcoal">Inspiration: </strong>
                      {product.designerInspiration}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="border-b border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => toggleSection("craft")}
                className="flex w-full items-center justify-between py-4 font-sans text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                <span>Craftsmanship &amp; Materials</span>
                <span className="text-sm">{openSection === "craft" ? "−" : "+"}</span>
              </button>
              {openSection === "craft" && (
                <div className="pb-4 font-sans text-xs text-[#4A4A4A] leading-relaxed space-y-1">
                  {product.craftOrigin && <p><strong>Origin:</strong> {product.craftOrigin}</p>}
                  {product.material && <p><strong>Material:</strong> {product.material}</p>}
                  {product.technique && <p><strong>Technique:</strong> {product.technique}</p>}
                  {product.fit && <p><strong>Fit:</strong> {product.fit}</p>}
                </div>
              )}
            </div>

            {designer && (
              <div className="border-b border-[#EBEBEB]">
                <button
                  type="button"
                  onClick={() => toggleSection("house")}
                  className="flex w-full items-center justify-between py-4 font-sans text-xs font-semibold uppercase tracking-wider text-charcoal"
                >
                  <span>About {designer.name}</span>
                  <span className="text-sm">{openSection === "house" ? "−" : "+"}</span>
                </button>
                {openSection === "house" && (
                  <div className="pb-4 font-sans text-xs text-[#4A4A4A] leading-relaxed space-y-2">
                    <p>{designer.foundingStory}</p>
                    {designer.founded && (
                      <p className="text-[10px] text-silver uppercase tracking-wide">
                        Est. {designer.founded} · {designer.location}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="border-b border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => toggleSection("shipping")}
                className="flex w-full items-center justify-between py-4 font-sans text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                <span>Shipping &amp; Care</span>
                <span className="text-sm">{openSection === "shipping" ? "−" : "+"}</span>
              </button>
              {openSection === "shipping" && (
                <div className="pb-4 font-sans text-xs text-[#4A4A4A] leading-relaxed space-y-1">
                  <p>White-glove packaging — each piece is hand-wrapped in archival tissue and housed in a branded keepsake box.</p>
                  <p>Complimentary insured shipping across India. International shipping available on request.</p>
                  <p>
                    Estimated delivery:{" "}
                    {product.deliveryText ||
                      "5–10 business days (bespoke pieces: timeline confirmed during consultation)."}
                  </p>
                  {product.careInstructions && (
                    <p className="pt-2">
                      <strong className="text-charcoal">Care: </strong>
                      {product.careInstructions}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="border-b border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => toggleSection("metrology")}
                className="flex w-full items-center justify-between py-4 font-sans text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                <span>Legal Metrology &amp; Compliance</span>
                <span className="text-sm">{openSection === "metrology" ? "−" : "+"}</span>
              </button>
              {openSection === "metrology" && (
                <div className="pb-4 font-sans text-xs text-[#4A4A4A] leading-relaxed space-y-1.5">
                  <p><strong>Net Quantity:</strong> {(product as { netQuantity?: string }).netQuantity || "1 Piece"}</p>
                  <p><strong>Shipping Weight:</strong> {(product as { weightGrams?: number }).weightGrams ? `${(product as { weightGrams?: number }).weightGrams}g` : "Standard"}</p>
                  <p><strong>Country of Origin:</strong> {(product as { countryOfOrigin?: string }).countryOfOrigin || "India"}</p>
                  <p><strong>Manufacturer / Brand:</strong> {(product as { manufacturerName?: string }).manufacturerName || product.designerName}</p>
                  {(product as { manufacturerAddress?: string }).manufacturerAddress && (
                    <p><strong>Manufacturer Address:</strong> {(product as { manufacturerAddress?: string }).manufacturerAddress}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <APlusContentRenderer modules={(product as { aPlusContent?: unknown })?.aPlusContent as never} />

        {recommendations.length > 0 && (
          <div className="mt-8 px-4 max-w-3xl mx-auto">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-charcoal mb-4">
              Complete the Look
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {recommendations.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        <ProductReviews productId={product.id} />

        {showConceptModal && (
          <ConceptInterestModal product={product} onClose={() => setShowConceptModal(false)} />
        )}

        {showSizeGuide && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-cloud pb-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-stone block">Garment Measurement Guide</span>
                  <h3 className="font-display text-base font-bold uppercase text-charcoal">{product.name}</h3>
                </div>
                <button type="button" onClick={() => setShowSizeGuide(false)} className="text-xs font-bold text-stone hover:text-charcoal">
                  ✕
                </button>
              </div>

              {(product as { sizeChart?: { unit?: string; rows?: Array<Record<string, string>> } }).sizeChart?.rows ? (
                <div className="space-y-3">
                  <p className="text-xs text-stone font-semibold">Unit: {(product as { sizeChart?: { unit?: string } }).sizeChart?.unit || "inches"}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-cloud text-[10px] font-bold uppercase text-stone bg-mist/50">
                          <th className="py-2 px-2">Size</th>
                          <th className="py-2 px-2">Chest</th>
                          <th className="py-2 px-2">Waist</th>
                          <th className="py-2 px-2">Hip</th>
                          <th className="py-2 px-2">Shoulder</th>
                          <th className="py-2 px-2">Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        {((product as { sizeChart?: { rows?: Array<Record<string, string>> } }).sizeChart?.rows || []).map((row) => (
                          <tr key={row.size} className="border-b border-cloud/40">
                            <td className="py-2 px-2 font-bold text-charcoal">{row.size}</td>
                            <td className="py-2 px-2 text-stone">{row.chest || "—"}</td>
                            <td className="py-2 px-2 text-stone">{row.waist || "—"}</td>
                            <td className="py-2 px-2 text-stone">{row.hip || "—"}</td>
                            <td className="py-2 px-2 text-stone">{row.shoulder || "—"}</td>
                            <td className="py-2 px-2 text-stone">{row.length || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-stone font-semibold">Standard Atelier Size Guide (Inches)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-cloud text-[10px] font-bold uppercase text-stone bg-mist/50">
                          <th className="py-2 px-2">Size</th>
                          <th className="py-2 px-2">Bust</th>
                          <th className="py-2 px-2">Waist</th>
                          <th className="py-2 px-2">Hip</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { size: "XS", bust: '32"', waist: '26"', hip: '35"' },
                          { size: "S", bust: '34"', waist: '28"', hip: '37"' },
                          { size: "M", bust: '36"', waist: '30"', hip: '39"' },
                          { size: "L", bust: '38"', waist: '32"', hip: '41"' },
                          { size: "XL", bust: '40"', waist: '34"', hip: '43"' },
                        ].map((row) => (
                          <tr key={row.size} className="border-b border-cloud/40">
                            <td className="py-2 px-2 font-bold text-charcoal">{row.size}</td>
                            <td className="py-2 px-2 text-stone">{row.bust}</td>
                            <td className="py-2 px-2 text-stone">{row.waist}</td>
                            <td className="py-2 px-2 text-stone">{row.hip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
