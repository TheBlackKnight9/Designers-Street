"use client";

import { FormEvent, useEffect, useState, MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/Toast";
import { MediaGalleryUploader } from "@/components/dashboard/MediaGalleryUploader";

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
};

export default function NewPostPage() {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [hotspot, setHotspot] = useState<{ xPercent: number; yPercent: number } | null>(null);

  const [form, setForm] = useState({
    image: "",
    videoUrl: "",
    caption: "",
    tag: "Product Showcase",
    status: "published",
  });

  useEffect(() => {
    fetch("/api/dashboard/products")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data.data?.products)) {
          setProducts(data.data.products);
        }
      })
      .catch(() => undefined);
  }, []);

  function handleImageClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHotspot({ xPercent: Math.round(x), yPercent: Math.round(y) });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.image && !form.videoUrl) {
      return push("Please upload an image or video", "err");
    }
    if (!form.caption.trim()) {
      return push("Please enter a caption", "err");
    }

    setLoading(true);
    try {
      const selectedProduct = products.find((p) => p.id === selectedProductId);
      const productTag = selectedProduct
        ? {
            productId: selectedProduct.id,
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            image: selectedProduct.images?.[0] || "",
            xPercent: hotspot?.xPercent ?? 50,
            yPercent: hotspot?.yPercent ?? 50,
          }
        : null;

      const res = await fetch("/api/dashboard/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productTag,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        push(
          form.status === "draft"
            ? "Post saved as draft!"
            : "Post published to customer feed!",
          "ok"
        );
        router.push("/dashboard/posts");
      } else {
        push(data?.error?.message || "Failed to create post", "err");
      }
    } catch {
      push("Failed to create post due to network error", "err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <Link
        href="/dashboard/posts"
        className="text-xs text-stone hover:text-charcoal font-semibold flex items-center gap-1"
      >
        ← Back to Posts Studio
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone">
            Universal Content Studio
          </p>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Create Feed Post
          </h1>
          <p className="text-xs text-stone mt-0.5">
            Publish high-resolution editorial photos &amp; videos with product hotspot tags
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-cloud space-y-6 shadow-xs">
        {/* 1. Media Upload / Selection */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal block">
            1. Media &amp; Preview (4:5 Portrait Recommended)
          </span>

          {form.image || form.videoUrl ? (
            <div className="space-y-3">
              <div
                className="relative aspect-4/5 max-w-sm mx-auto rounded-2xl overflow-hidden border border-cloud bg-black/5 cursor-crosshair shadow-sm"
                onClick={handleImageClick}
                title="Click anywhere to place a product hotspot tag"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image || form.videoUrl}
                  alt="Post Preview"
                  className="w-full h-full object-cover"
                />

                {/* Hotspot Tag Overlay */}
                {hotspot && (
                  <div
                    className="absolute w-7 h-7 -ml-3.5 -mt-3.5 bg-white/95 text-charcoal rounded-full flex items-center justify-center font-bold text-xs shadow-lg border border-charcoal/30 animate-pulse"
                    style={{ left: `${hotspot.xPercent}%`, top: `${hotspot.yPercent}%` }}
                  >
                    🛍️
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setForm({ ...form, image: "", videoUrl: "" });
                    setHotspot(null);
                  }}
                  className="absolute top-3 right-3 bg-black/80 text-white rounded-full px-3 py-1 text-xs font-bold shadow-md hover:bg-black"
                >
                  Change Media
                </button>
              </div>

              <p className="text-[11px] text-stone text-center font-medium">
                💡 {hotspot ? `Hotspot set at (${hotspot.xPercent}%, ${hotspot.yPercent}%)` : "Click anywhere on the image preview to place an interactive product hotspot!"}
              </p>
            </div>
          ) : (
            <MediaGalleryUploader
              label="Select Media File or Direct Image URL"
              folder="feed-posts"
              onMediaAdded={(item) => {
                if (item.type === "video") {
                  setForm((f) => ({ ...f, videoUrl: item.url, image: item.url }));
                } else {
                  setForm((f) => ({ ...f, image: item.url, videoUrl: "" }));
                }
              }}
            />
          )}
        </div>

        {/* 2. Product Hotspot Tagging */}
        <div className="space-y-3 pt-4 border-t border-cloud">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">
            2. Attach Product Hotspot Tag
          </h2>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Select Product from Active House Catalog
            </span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40 font-medium"
            >
              <option value="">No Product Tagged</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.price.toLocaleString("en-IN")})
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 3. Post Category & Caption */}
        <div className="space-y-4 pt-4 border-t border-cloud">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">
            3. Post Category &amp; Caption
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {["Product Showcase", "Behind the Scenes", "Collection Drop"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, tag: t })}
                className={`py-2.5 text-xs font-bold uppercase rounded-xl border transition-colors ${
                  form.tag === t
                    ? "bg-charcoal text-paper border-charcoal"
                    : "bg-mist text-stone border-cloud"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Caption (Supports #hashtags and @mentions) *
            </span>
            <textarea
              required
              rows={4}
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="Unveiling our handcrafted Zardozi bridal lehenga for the autumn couture drop... #LuxuryFashion #HeritageCouture"
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
            />
          </label>

          <div className="flex gap-2">
            {["#HauteCouture", "#Handcrafted", "#BridalWear", "#LuxuryFashion"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (!form.caption.includes(tag)) {
                    setForm((f) => ({ ...f, caption: f.caption ? `${f.caption} ${tag}` : tag }));
                  }
                }}
                className="px-2.5 py-1 bg-mist text-stone text-[10px] font-bold rounded-lg border border-cloud hover:border-charcoal hover:text-charcoal"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-cloud flex items-center justify-between">
          <Link
            href="/dashboard/posts"
            className="px-5 py-2.5 border border-cloud text-stone text-xs font-bold uppercase rounded-full hover:bg-mist"
          >
            Cancel
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setForm((f) => ({ ...f, status: "draft" }));
                const fakeEvent = { preventDefault: () => {} } as FormEvent;
                onSubmit(fakeEvent);
              }}
              disabled={loading}
              className="px-5 py-2.5 border border-cloud text-charcoal text-xs font-bold uppercase rounded-full hover:bg-mist"
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-black disabled:opacity-60 transition-colors"
            >
              {loading ? "Publishing…" : "Publish to Customer Feed"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
