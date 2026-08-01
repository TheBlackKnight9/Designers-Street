"use client";

import { FormEvent, useEffect, useState, MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/Toast";

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
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [hotspot, setHotspot] = useState<{ xPercent: number; yPercent: number } | null>(null);

  const [form, setForm] = useState({
    image: "",
    videoUrl: "",
    caption: "",
    tag: "Product Showcase",
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

  async function handleFileUpload(file: File | null) {
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const maxMB = isVideo ? 100 : 10;

    if (file.size > maxMB * 1024 * 1024) {
      return push(`File size exceeds maximum allowed limit (${maxMB}MB)`, "err");
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "designer-feed");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && (data?.data?.secureUrl || data?.url)) {
        const mediaUrl = data?.data?.secureUrl || data?.url;
        if (isVideo) {
          setForm((f) => ({ ...f, videoUrl: mediaUrl, image: data?.data?.thumbnailUrl || mediaUrl }));
        } else {
          setForm((f) => ({ ...f, image: mediaUrl, videoUrl: "" }));
        }
        push("Media uploaded successfully", "ok");
      } else {
        push(data?.error?.message || "Upload failed", "err");
      }
    } catch {
      push("Upload failed due to network error", "err");
    } finally {
      setUploading(false);
    }
  }

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
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            image: selectedProduct.images[0],
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
        push("Post published to customer feed!", "ok");
        router.push("/dashboard/posts");
      } else {
        push(data?.error?.message || "Failed to publish post", "err");
      }
    } catch {
      push("Failed to publish post", "err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/posts" className="text-xs text-stone hover:text-charcoal font-semibold">
        ← Back to Posts
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          Create Feed Post
        </h1>
        <p className="text-xs text-stone mt-1">
          Publish high-resolution editorial photos &amp; videos with product hotspot tags
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-cloud space-y-6 shadow-xs">
        {/* Media Upload Area */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">
            1. Upload Media (4:5 Portrait Recommended)
          </span>

          {form.image || form.videoUrl ? (
            <div className="relative aspect-4/5 max-w-sm mx-auto rounded-2xl overflow-hidden border border-cloud bg-black/5" onClick={handleImageClick}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image} alt="" className="w-full h-full object-cover" />

              {/* Hotspot Tag Preview */}
              {hotspot && (
                <div
                  className="absolute w-6 h-6 -ml-3 -mt-3 bg-white/90 text-charcoal rounded-full flex items-center justify-center font-bold text-xs shadow-md border border-charcoal/20 animate-bounce"
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
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 text-xs"
              >
                Change Media
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-cloud rounded-2xl p-8 text-center space-y-3 bg-mist/30">
              <span className="text-3xl">📸</span>
              <p className="text-xs font-bold text-charcoal">
                {uploading ? "Uploading media to Cloudinary…" : "Upload Photo or Short Video (<60s)"}
              </p>
              <p className="text-[10px] text-stone">JPG, PNG, WebP (Max 10MB) or MP4, MOV (Max 100MB)</p>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                className="hidden"
                id="feed-media-upload"
              />
              <label
                htmlFor="feed-media-upload"
                className="inline-block px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase rounded-full cursor-pointer hover:bg-black"
              >
                Select Media File
              </label>
            </div>
          )}
          {form.image && (
            <p className="text-[10px] text-stone text-center italic">
              💡 Tip: Click anywhere on the image preview above to place a product hotspot tag!
            </p>
          )}
        </div>

        {/* Product Hotspot Tagging */}
        <div className="space-y-3 pt-2 border-t border-cloud">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">
            2. Attach Product Tag &amp; Hotspot
          </h2>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Select Product from Your Catalog
            </span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
            >
              <option value="">No Product Tag</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.price.toLocaleString("en-IN")})
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Post Type & Caption */}
        <div className="space-y-4 pt-2 border-t border-cloud">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">
            3. Post Details &amp; Caption
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {["Product Showcase", "Behind the Scenes", "Collection Drop"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, tag: type })}
                className={`py-2.5 text-xs font-bold uppercase rounded-xl border transition-colors ${
                  form.tag === type
                    ? "bg-charcoal text-paper border-charcoal"
                    : "bg-mist text-stone border-cloud"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
              Caption (Hashtags &amp; Mentions) *
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
        </div>

        <div className="pt-4 border-t border-cloud flex justify-end gap-2">
          <Link
            href="/dashboard/posts"
            className="px-6 py-3 border border-cloud text-stone text-xs font-bold uppercase rounded-full"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-8 py-3 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md disabled:opacity-60"
          >
            {loading ? "Publishing Post…" : "Publish to Customer Feed"}
          </button>
        </div>
      </form>
    </div>
  );
}
