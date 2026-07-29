"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useData } from "@/context/DataContext";
import { formatPrice } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { productId } = use(params);
  const { products, designers } = useData();
  const { addItem } = useCart();
  const { isWished, toggle } = useWishlist();

  const product = products.find((p) => p.id === productId);
  const designer = product ? designers.find((d) => d.id === product.designerId || d.name === product.designerName) : null;

  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("story");
  const [error, setError] = useState("");

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
        <BottomNav />
      </>
    );
  }

  const wished = isWished(product.id);

  const recommendations = products.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.designerId === product.designerId)
  ).slice(0, 4);

  const handleAddToBag = () => {
    if (!selectedSize) {
      setError("Please select a size");
      return;
    }
    setError("");
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.designerName,
      price: product.price,
      size: selectedSize,
      image: product.images[0],
    });
  };

  const toggleSection = (s: string) => setOpenSection(openSection === s ? null : s);

  return (
    <>
      <TopBar />
      <main className="min-h-screen pb-4">
        {/* Image Carousel */}
        <div className="relative w-full aspect-[3/4] bg-[#F0F0F0]">
          <Image
            src={product.images[activeImage]}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />

          {/* Image dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === activeImage ? "bg-white w-4" : "bg-white/50"
                  }`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Limited badge */}
          {product.piecesRemaining && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
              <span className="limited-badge text-[#2B2B2B]">
                Limited — {product.piecesRemaining} remaining
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 pt-5">
          {/* Designer + Name + Price */}
          <div className="mb-5">
            <Link
              href={designer ? `/designer/${designer.handle}` : "#"}
              className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0]"
            >
              {product.designerName}
            </Link>
            <h1 className="font-display text-xl font-bold text-[#2B2B2B] leading-tight mt-1">
              {product.name}
            </h1>
            {/* Price Row: Our Price + Strikethrough MRP + Discount % */}
            <div className="flex items-baseline gap-2.5 mt-2.5 flex-wrap">
              <span className="font-sans text-xl font-extrabold text-[#2B2B2B]">
                {formatPrice(product.price)}
              </span>
              <span className="font-sans text-xs text-[#7A7A7A] line-through">
                MRP {formatPrice(product.mrp || Math.round(product.price * 1.15))}
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-sans text-[10px] font-extrabold uppercase tracking-wider">
                {Math.round(
                  (((product.mrp || Math.round(product.price * 1.15)) - product.price) /
                    (product.mrp || Math.round(product.price * 1.15))) *
                    100
                )}% OFF
              </span>
            </div>

            {/* Best Offer Price Callout Badge */}
            {product.bestPrice && (
              <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-900 font-sans text-xs font-bold shadow-2xs">
                <span>🎉 Best Offer Price:</span>
                <span className="font-extrabold text-emerald-800">{formatPrice(product.bestPrice)}</span>
              </div>
            )}

            {product.occasion && (
              <span className="inline-block mt-3 px-2.5 py-1 bg-[#F0F0F0] font-sans text-[10px] font-semibold uppercase tracking-wider text-[#4A4A4A] rounded-full">
                {product.occasion}
              </span>
            )}
          </div>

          {/* Sizes */}
          <div className="mb-5">
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] block mb-3">
              Select Size
            </span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => { setSelectedSize(size); setError(""); }}
                  className={`h-10 min-w-[44px] px-3 border text-xs font-semibold rounded-lg transition-all ${
                    selectedSize === size
                      ? "border-[#2B2B2B] bg-[#2B2B2B] text-[#FAFAFA]"
                      : "border-[#E0E0E0] text-[#2B2B2B]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {error && (
              <p className="mt-2 font-sans text-xs font-medium text-[#2B2B2B] bg-[#F0F0F0] px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-5">
            <button
              type="button"
              onClick={handleAddToBag}
              className="flex-1 h-12 bg-[#2B2B2B] text-[#FAFAFA] font-sans text-xs font-semibold uppercase tracking-wider rounded-full btn-press"
            >
              Add to Bag
            </button>
            <button
              type="button"
              onClick={() => toggle(product.id)}
              className={`h-12 w-12 flex items-center justify-center border rounded-full transition-colors ${
                wished ? "bg-[#2B2B2B] border-[#2B2B2B]" : "border-[#E0E0E0]"
              }`}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg
                className={`h-5 w-5 transition-colors ${
                  wished ? "fill-[#FAFAFA] text-[#FAFAFA]" : "fill-none text-[#2B2B2B]"
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </button>
          </div>

          {/* Customize CTA */}
          {product.customizable && (
            <Link
              href="/bespoke"
              className="flex items-center justify-center h-12 border border-[#2B2B2B] text-[#2B2B2B] font-sans text-xs font-semibold uppercase tracking-wider rounded-full btn-press mb-5"
            >
              Customize This Piece
            </Link>
          )}

          {/* Concierge */}
          <div className="flex items-center gap-2 mb-6 py-3 border-t border-b border-[#EBEBEB]">
            <svg className="w-4 h-4 text-[#7A7A7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span className="font-sans text-xs text-[#7A7A7A]">
              Need help? <span className="font-semibold text-[#2B2B2B] underline">Speak to a stylist</span>
            </span>
          </div>

          {/* Accordion Sections */}
          <div className="space-y-0">
            {/* Story */}
            <div className="border-b border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => toggleSection("story")}
                className="flex w-full items-center justify-between py-4 font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B]"
              >
                <span>The Story</span>
                <span className="text-sm">{openSection === "story" ? "−" : "+"}</span>
              </button>
              {openSection === "story" && (
                <div className="pb-4 font-sans text-xs text-[#4A4A4A] leading-relaxed space-y-2">
                  <p>{product.description}</p>
                  {product.story && <p className="italic text-[#7A7A7A]">{product.story}</p>}
                </div>
              )}
            </div>

            {/* Craft & Material */}
            <div className="border-b border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => toggleSection("craft")}
                className="flex w-full items-center justify-between py-4 font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B]"
              >
                <span>Craft &amp; Material</span>
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

            {/* About the House */}
            {designer && (
              <div className="border-b border-[#EBEBEB]">
                <button
                  type="button"
                  onClick={() => toggleSection("house")}
                  className="flex w-full items-center justify-between py-4 font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B]"
                >
                  <span>About {designer.name}</span>
                  <span className="text-sm">{openSection === "house" ? "−" : "+"}</span>
                </button>
                {openSection === "house" && (
                  <div className="pb-4 font-sans text-xs text-[#4A4A4A] leading-relaxed space-y-2">
                    <p>{designer.foundingStory}</p>
                    {designer.founded && (
                      <p className="text-[10px] text-[#A0A0A0] uppercase tracking-wide">
                        Est. {designer.founded} · {designer.location}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Shipping */}
            <div className="border-b border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => toggleSection("shipping")}
                className="flex w-full items-center justify-between py-4 font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B]"
              >
                <span>Shipping &amp; Care</span>
                <span className="text-sm">{openSection === "shipping" ? "−" : "+"}</span>
              </button>
              {openSection === "shipping" && (
                <div className="pb-4 font-sans text-xs text-[#4A4A4A] leading-relaxed space-y-1">
                  <p>White-glove packaging — each piece is hand-wrapped in archival tissue and housed in a branded keepsake box.</p>
                  <p>Complimentary insured shipping across India. International shipping available on request.</p>
                  <p>Estimated delivery: 5–10 business days (bespoke pieces: timeline confirmed during consultation).</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-8 px-4">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-[#2B2B2B] mb-4">
              Complete the Look
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {recommendations.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
