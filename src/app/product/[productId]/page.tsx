"use client";

import { use, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical, Heart, Star, Eye, Share2, Check, Copy } from "lucide-react";
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
import { LuxuryBadges } from "@/components/luxury/LuxuryBadges";
import { ScarcityStrip } from "@/components/luxury/ScarcityStrip";
import { TrustSignals } from "@/components/luxury/TrustSignals";
import { APlusContentRenderer } from "@/components/product/APlusContentRenderer";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ConceptInterestModal } from "@/components/product/ConceptInterestModal";
import { ProductStickyActions } from "@/components/product/ProductStickyActions";
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
  const [showMenu, setShowMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize selected size if product has sizes
  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedSize]);

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
    const sizeToUse = selectedSize || product.sizes[0] || "M";
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
      size: sizeToUse,
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

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => {
        setCopiedLink(false);
        setShowMenu(false);
      }, 1500);
    }
  };

  const toggleSection = (s: string) => setOpenSection(openSection === s ? null : s);

  const lType = (product as { listingType?: string }).listingType || "COMMERCIAL";
  const isConcept = lType !== "COMMERCIAL";

  let conceptLabel = "Request Quote";
  switch (lType) {
    case "CONCEPT_ART":
      conceptLabel = "Request Design";
      break;
    case "LIMITED_EDITION":
      conceptLabel = "Reserve Piece";
      break;
    case "BESPOKE_ONLY":
      conceptLabel = "Book Consultation";
      break;
    case "PREORDER":
      conceptLabel = "Pre-order";
      break;
    case "DIGITAL_PATTERN":
      conceptLabel = "Request License";
      break;
    case "LOOKBOOK":
    case "RUNWAY":
    case "COLLABORATION":
      conceptLabel = "Express Interest";
      break;
    default:
      conceptLabel = "Request Quote";
  }

  // Stock remaining computation
  const stockRemaining = product.piecesRemaining ?? 5;
  // Dynamic sold count derived from ID or price
  const soldCount = (product as { soldCount?: number }).soldCount ?? (Math.abs(product.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 65) + 25);
  // Rating & Review count
  const ratingValue = (product.rating ?? 4.7).toFixed(1);
  const reviewsCount = (product as { reviewsCount?: number }).reviewsCount ?? 69;

  // Format category name for header (e.g. "Sneakers Detail" or "Collection Detail")
  const categoryHeader = product.category 
    ? `${product.category.charAt(0).toUpperCase() + product.category.slice(1)} Detail`
    : "Product Detail";

  return (
    <>
      {/* Show TopBar on desktop for navigation breadcrumbs */}
      <div className="hidden md:block">
        <TopBar />
      </div>

      <main className="min-h-screen bg-white pb-32 md:pb-16 text-[#1A1A1A]">
        {/* Mobile Header Bar matching reference: [ ← ]  Category Detail  [ ⋮ ] */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>

          <h1 className="font-sans text-base font-bold text-gray-900 tracking-tight text-center truncate max-w-[200px]">
            {categoryHeader}
          </h1>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="w-10 h-10 -mr-1 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                  <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `${product.designerName} — ${product.name}`,
                        url: window.location.href,
                      }).catch(() => {});
                    } else {
                      handleCopyLink();
                    }
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-gray-500" />
                  <span>Share Piece</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-3 md:pt-8">
          <div className="md:grid md:grid-cols-2 md:gap-10 items-start">

            {/* LEFT COLUMN: Hero Stage + Horizontal Thumbnails */}
            <div>
              {/* Main Hero Stage - soft neutral rounded stage from reference */}
              <div className="relative w-full aspect-square md:aspect-[4/4] rounded-3xl bg-[#F5F6F8] p-4 flex items-center justify-center overflow-hidden">
                <button
                  type="button"
                  className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                  onClick={() => openGallery(activeImage)}
                  aria-label="Enlarge image"
                >
                  <Image
                    src={product.images[activeImage]}
                    alt={product.name}
                    fill
                    className="object-contain p-4 drop-shadow-sm transition-transform duration-300 hover:scale-105 pointer-events-none"
                    priority
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                </button>

                {/* Bottom Center Pill Badge (360° / Angle View) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                  <button
                    type="button"
                    onClick={() => openGallery(activeImage)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-gray-200/60 text-xs font-bold text-gray-800 hover:bg-white active:scale-95 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>View Full / 360°</span>
                  </button>
                </div>

                {/* Lookbook Video Pill if available */}
                {product.videos && product.videos.length > 0 && (
                  <button
                    type="button"
                    onClick={openLookbook}
                    className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-white backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                    <span>Lookbook</span>
                  </button>
                )}
              </div>

              {/* Horizontal Thumbnail Strip - directly beneath the hero stage */}
              {product.images.length > 1 && (
                <div className="mt-3 flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  {product.images.map((src, i) => {
                    const isActive = i === activeImage;
                    return (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-[#F5F6F8] p-1 flex-shrink-0 transition-all ${
                          isActive
                            ? "border-2 border-[#FF6B00] ring-2 ring-[#FF6B00]/20 opacity-100 scale-102"
                            : "border border-gray-200/60 opacity-70 hover:opacity-100"
                        }`}
                        aria-label={`View angle ${i + 1}`}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-contain p-1"
                          sizes="80px"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Product Info, Badges, Size Selector, Details */}
            <div className="mt-5 md:mt-0 space-y-4">

              {/* Row 1: Title + Pedigree + Wishlist Heart Button */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Link
                      href={getDesignerUrl(designer?.handle) ?? "#"}
                      className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 hover:text-[#FF6B00] transition-colors"
                    >
                      {product.designerName}
                    </Link>
                    {(designer?.verified || product.verified) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-[#EA580C] text-[9px] font-bold uppercase tracking-wider border border-orange-200">
                        Verified Atelier ✓
                      </span>
                    )}
                  </div>
                  <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-normal text-stone-950 tracking-tight leading-tight">
                    {product.name}
                  </h1>
                </div>

                {/* Circular Wishlist Heart button */}
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all active:scale-90 flex-shrink-0 ${
                    wished
                      ? "bg-rose-50 border-rose-200 text-rose-500 shadow-sm"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs"
                  }`}
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${wished ? "fill-rose-500 text-rose-500" : "stroke-[1.8]"}`} />
                </button>
              </div>

              {/* Row 2: Price */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-sans text-2xl md:text-3xl font-bold text-stone-950 tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="font-sans text-sm text-stone-400 line-through">
                      {formatPrice(product.mrp)}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-50 text-[#EA580C] border border-orange-200 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider">
                      {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Row 3: Capsule Badges Row: [ 5 Pair Left ]  [ Sold 50 ]  [ ★ 4.7 (69 Reviews) ] */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {/* Badge 1: Stock Remaining */}
                <div className="px-3 py-1.5 rounded-full bg-[#F5F6F8] text-xs font-semibold text-gray-700 border border-gray-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                  <span>{stockRemaining} Pair Left</span>
                </div>

                {/* Badge 2: Sold Count */}
                <div className="px-3 py-1.5 rounded-full bg-[#F5F6F8] text-xs font-semibold text-gray-700 border border-gray-100">
                  Sold {soldCount}
                </div>

                {/* Badge 3: Rating & Reviews */}
                <div className="px-3 py-1.5 rounded-full bg-[#F5F6F8] text-xs font-semibold text-gray-700 border border-gray-100 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{ratingValue} ({reviewsCount} Reviews)</span>
                </div>
              </div>

              {/* Concept Showcase Notice if applicable */}
              {isConcept && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 font-sans text-xs font-semibold">
                  Atelier Concept Piece — Available exclusively on bespoke request or private commission.
                </div>
              )}

              {/* Row 4: Size Selector with "Size chart" trigger */}
              <div id="product-size-section" className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-gray-900">
                    Select Size
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="font-sans text-xs font-bold text-[#EA580C] hover:text-[#C2410C] hover:underline cursor-pointer transition-colors"
                  >
                    Size chart
                  </button>
                </div>

                {/* Horizontal Capsule Pills (active: solid luxury orange; inactive: white with border) */}
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {(product.sizes && product.sizes.length > 0 ? product.sizes : ["38", "39", "40", "41", "42"]).map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setError("");
                        }}
                        className={`min-w-[48px] h-10 px-4 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center justify-center ${
                          isSelected
                            ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/20"
                            : "bg-white border border-gray-200 text-gray-800 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <p className="mt-2 text-xs font-semibold text-rose-500">
                    {error}
                  </p>
                )}
              </div>

              {/* Desktop Inline Actions Bar (Hidden on Mobile, as mobile uses ProductStickyActions) */}
              <div className="hidden md:flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleAddToBag}
                  className="flex-1 h-12 flex items-center justify-center gap-2 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] bg-white font-sans text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition-all hover:bg-[#FF6B00]/5 shadow-xs"
                >
                  <span>{inBag ? `In Bag (${bagQty})` : "Add to Bag"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 h-12 flex items-center justify-center rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white font-sans text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition-all shadow-md shadow-orange-500/25"
                >
                  Acquire Piece
                </button>
              </div>

              {/* Trust signals & scarcity */}
              <div className="pt-2">
                <LuxuryBadges product={product} designerVerified={designer?.verified} />
                <ScarcityStrip product={product} className="mt-2" />
                <TrustSignals
                  deliveryText={product.deliveryText}
                  verifiedDesigner={Boolean(designer?.verified || product.verified)}
                  className="mt-3"
                />
              </div>

              {/* Accordion Sections: Story, Craftsmanship, House, Shipping & Care */}
              <div className="pt-2 divide-y divide-gray-100 border-t border-gray-100">
                {/* Story */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection("story")}
                    className="flex w-full items-center justify-between py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-black"
                  >
                    <span>Description &amp; Story</span>
                    <span className="text-base font-normal text-gray-500">
                      {openSection === "story" ? "−" : "+"}
                    </span>
                  </button>
                  {openSection === "story" && (
                    <div className="pb-3 text-xs text-gray-600 leading-relaxed space-y-2">
                      <p>{product.description}</p>
                      {product.story && <p className="italic text-gray-500">{product.story}</p>}
                    </div>
                  )}
                </div>

                {/* Craftsmanship */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection("craft")}
                    className="flex w-full items-center justify-between py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-black"
                  >
                    <span>Craftsmanship &amp; Materials</span>
                    <span className="text-base font-normal text-gray-500">
                      {openSection === "craft" ? "−" : "+"}
                    </span>
                  </button>
                  {openSection === "craft" && (
                    <div className="pb-3 text-xs text-gray-600 leading-relaxed space-y-1">
                      {product.material && <p><strong>Material:</strong> {product.material}</p>}
                      {product.craftOrigin && <p><strong>Origin:</strong> {product.craftOrigin}</p>}
                      {product.technique && <p><strong>Technique:</strong> {product.technique}</p>}
                      {product.fit && <p><strong>Fit:</strong> {product.fit}</p>}
                    </div>
                  )}
                </div>

                {/* Designer House */}
                {designer && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSection("house")}
                      className="flex w-full items-center justify-between py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-black"
                    >
                      <span>About {designer.name}</span>
                      <span className="text-base font-normal text-gray-500">
                        {openSection === "house" ? "−" : "+"}
                      </span>
                    </button>
                    {openSection === "house" && (
                      <div className="pb-3 text-xs text-gray-600 leading-relaxed space-y-1.5">
                        <p>{designer.foundingStory}</p>
                        {designer.founded && (
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                            Est. {designer.founded} · {designer.location}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Shipping & Care */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection("shipping")}
                    className="flex w-full items-center justify-between py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-black"
                  >
                    <span>Shipping &amp; Care</span>
                    <span className="text-base font-normal text-gray-500">
                      {openSection === "shipping" ? "−" : "+"}
                    </span>
                  </button>
                  {openSection === "shipping" && (
                    <div className="pb-3 text-xs text-gray-600 leading-relaxed space-y-1">
                      <p>Hand-wrapped white-glove packaging in archival boxes.</p>
                      <p>Complimentary insured priority courier delivery across India.</p>
                      <p>
                        Estimated delivery:{" "}
                        {product.deliveryText || "3–7 business days with door-to-door tracking."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Private VIP Concierge Consultation */}
              <div className="p-4.5 rounded-3xl bg-[#FFF7ED] border border-orange-200/70 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-base shadow-xs flex-shrink-0">
                    🪡
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 leading-tight">Need Bespoke Fitting or Styling?</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">Consult with our private haute couture stylist</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hello Designer's Street Concierge, I am inquiring about: ${product.name} by ${product.designerName} (${formatPrice(product.price)}). Could I get assistance on bespoke sizing and fitting?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all flex-shrink-0"
                >
                  Chat Stylist
                </a>
              </div>

              {/* Atelier Spotlight Card */}
              {designer && (
                <div className="p-5 rounded-3xl bg-[#F8F9FA] border border-black/[0.05] space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-900 border border-black/10 relative flex items-center justify-center font-serif text-white font-bold text-base flex-shrink-0">
                        {designer.logo ? (
                          <Image src={designer.logo} alt={designer.name} fill className="object-cover" />
                        ) : (
                          designer.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <span className="editorial-eyebrow block mb-0.5">Atelier House</span>
                        <h4 className="font-serif text-base font-normal text-stone-950 leading-tight">
                          {designer.name}
                        </h4>
                        <p className="text-[10px] text-stone-400 font-sans mt-0.5">
                          {designer.location || "India"} {designer.founded ? `· Est. ${designer.founded}` : ""}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={getDesignerUrl(designer.handle) ?? "/designers"}
                      className="px-3.5 py-1.5 rounded-full border border-stone-300 text-stone-900 hover:border-[#FF6B00] hover:text-[#FF6B00] text-[10px] font-bold uppercase tracking-wider transition-all"
                    >
                      Visit House →
                    </Link>
                  </div>
                  {designer.foundingStory && (
                    <p className="text-xs text-stone-600 font-normal leading-relaxed line-clamp-2">
                      {designer.foundingStory}
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* A+ Content Section */}
        <APlusContentRenderer modules={(product as { aPlusContent?: unknown })?.aPlusContent as never} />

        {/* Complete the Look recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-12 px-4 max-w-4xl mx-auto">
            <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
              Complete the Look
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {recommendations.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <div className="mt-10 max-w-4xl mx-auto px-4">
          <ProductReviews productId={product.id} />
        </div>

        {/* Concept Modal */}
        {showConceptModal && (
          <ConceptInterestModal product={product} onClose={() => setShowConceptModal(false)} />
        )}

        {/* Mobile Sticky Bottom Action Bar */}
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

        {/* Size Guide Modal (Triggered by "Size chart" green link) */}
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C] block">
                    Bespoke Sizing &amp; Measurements Guide
                  </span>
                  <h3 className="font-serif text-base font-medium text-stone-950">{product.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {(product as { sizeChart?: { unit?: string; rows?: Array<Record<string, string>> } }).sizeChart?.rows ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-semibold">
                    Measurements in: {(product as { sizeChart?: { unit?: string } }).sizeChart?.unit || "inches"}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-[10px] font-bold uppercase text-gray-500 bg-[#F5F6F8]">
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3">Chest/Bust</th>
                          <th className="py-2.5 px-3">Waist</th>
                          <th className="py-2.5 px-3">Hip</th>
                          <th className="py-2.5 px-3">Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        {((product as { sizeChart?: { rows?: Array<Record<string, string>> } }).sizeChart?.rows || []).map((row) => (
                          <tr key={row.size} className="border-b border-gray-100">
                            <td className="py-2.5 px-3 font-bold text-gray-900">{row.size}</td>
                            <td className="py-2.5 px-3 text-gray-600">{row.chest || row.bust || "—"}</td>
                            <td className="py-2.5 px-3 text-gray-600">{row.waist || "—"}</td>
                            <td className="py-2.5 px-3 text-gray-600">{row.hip || "—"}</td>
                            <td className="py-2.5 px-3 text-gray-600">{row.length || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-semibold">Standard Atelier Sizing Guide</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-[10px] font-bold uppercase text-gray-500 bg-[#F5F6F8]">
                          <th className="py-2.5 px-3">Size / US</th>
                          <th className="py-2.5 px-3">EU</th>
                          <th className="py-2.5 px-3">Foot / Chest (in)</th>
                          <th className="py-2.5 px-3">Fit Advice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { us: "38 / S", eu: "38", metric: '9.8" / 36"', advice: "True to size" },
                          { us: "39 / M", eu: "39", metric: '10.1" / 38"', advice: "True to size" },
                          { us: "40 / M", eu: "40", metric: '10.3" / 40"', advice: "Comfort fit" },
                          { us: "41 / L", eu: "41", metric: '10.6" / 42"', advice: "Standard fit" },
                          { us: "42 / XL", eu: "42", metric: '10.9" / 44"', advice: "Standard fit" },
                        ].map((row) => (
                          <tr key={row.us} className="border-b border-gray-100">
                            <td className="py-2.5 px-3 font-bold text-gray-900">{row.us}</td>
                            <td className="py-2.5 px-3 text-gray-600">{row.eu}</td>
                            <td className="py-2.5 px-3 text-gray-600">{row.metric}</td>
                            <td className="py-2.5 px-3 text-[#EA580C] font-semibold">{row.advice}</td>
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
