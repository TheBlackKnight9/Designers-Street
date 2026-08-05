"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDashboardProduct,
  createDashboardProduct,
  updateDashboardProduct,
  setDashboardProductStatus,
  registerDashboardMedia,
  deleteDashboardMedia,
  reorderDashboardMedia,
  signDashboardUpload,
  type DashboardProductDetail,
} from "@/lib/api/dashboard";
import { MediaGalleryUploader } from "./MediaGalleryUploader";
import { ProductPreview } from "./ProductPreview";
import { SizeChartBuilder } from "./SizeChartBuilder";
import { useToast } from "./Toast";
import type { ProductStatus } from "@prisma/client";
import {
  COLLECTION_SUBCATEGORIES,
  productCategoriesForGender,
  STYLE_SUBCATEGORIES,
} from "@/lib/category-tree";

type FormState = {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: string;
  basePrice: string;
  mrp: string;
  gender: "men" | "women" | "unisex";
  sizes: string;
  colors: string;
  tags: string;
  piecesRemaining: string;
  deliveryText: string;
  customizable: boolean;
  limitedEdition: boolean;
  status: ProductStatus;
  listingType: "COMMERCIAL" | "CONCEPT_ART";
  conceptCta: "BESPOKE_INQUIRY" | "EXPRESS_INTEREST" | "PRE_ORDER_DEPOSIT";
  estimatedLaunch: string;
  weightGrams: string;
  netQuantity: string;
  manufacturerName: string;
  manufacturerAddress: string;
  countryOfOrigin: string;
  sizeChart: any;
};

function toForm(p?: DashboardProductDetail | null): FormState {
  return {
    name: p?.name ?? "",
    description: p?.description ?? "",
    category: p?.category ?? "",
    subcategory: p?.subcategory ?? "",
    price: p?.price != null ? String(p.price) : "",
    basePrice: (p as any)?.basePrice != null ? String((p as any).basePrice) : (p?.price != null ? String(p.price) : ""),
    mrp: p?.mrp != null ? String(p.mrp) : "",
    gender: p?.gender ?? "unisex",
    sizes: (p?.sizes || []).join(", "),
    colors: (p?.colors || []).join(", "),
    tags: (p?.tags || []).join(", "),
    piecesRemaining:
      p?.piecesRemaining != null ? String(p.piecesRemaining) : "",
    deliveryText: p?.deliveryText ?? "",
    customizable: Boolean(p?.customizable),
    limitedEdition: Boolean(p?.limitedEdition),
    status: p?.status ?? "draft",
    listingType: (p as any)?.listingType || "COMMERCIAL",
    conceptCta: (p as any)?.conceptCta || "BESPOKE_INQUIRY",
    estimatedLaunch: (p as any)?.estimatedLaunch || "",
    weightGrams: (p as any)?.weightGrams != null ? String((p as any).weightGrams) : "",
    netQuantity: (p as any)?.netQuantity || "",
    manufacturerName: (p as any)?.manufacturerName || "",
    manufacturerAddress: (p as any)?.manufacturerAddress || "",
    countryOfOrigin: (p as any)?.countryOfOrigin || "India",
    sizeChart: (p as any)?.sizeChart || null,
  };
}

function formPayload(form: FormState) {
  return {
    name: form.name,
    description: form.description,
    category: form.category,
    subcategory: form.subcategory || null,
    price: Number(form.price || 0),
    basePrice: form.basePrice ? Number(form.basePrice) : null,
    mrp: form.mrp ? Number(form.mrp) : null,
    gender: form.gender,
    sizes: form.sizes,
    colors: form.colors,
    tags: form.tags,
    piecesRemaining: form.piecesRemaining
      ? Number(form.piecesRemaining)
      : null,
    deliveryText: form.deliveryText || null,
    customizable: form.customizable,
    limitedEdition: form.limitedEdition,
    status: form.status,
    listingType: form.listingType,
    conceptCta: form.conceptCta,
    estimatedLaunch: form.estimatedLaunch || null,
    weightGrams: form.weightGrams ? Number(form.weightGrams) : null,
    netQuantity: form.netQuantity || null,
    manufacturerName: form.manufacturerName || null,
    manufacturerAddress: form.manufacturerAddress || null,
    countryOfOrigin: form.countryOfOrigin || "India",
    sizeChart: form.sizeChart,
  };
}

async function uploadToCloudinary(
  file: File,
  signed: {
    cloudName: string;
    apiKey: string;
    timestamp: number;
    folder: string;
    signature: string;
    resourceType: string;
  },
  signal: AbortSignal,
  onProgress: (ratio: number) => void
): Promise<Record<string, unknown>> {
  const resource =
    file.type.startsWith("video/")
      ? "video"
      : signed.resourceType === "video"
        ? "video"
        : "image";

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resource}/upload`;
    xhr.open("POST", url);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) onProgress(ev.loaded / ev.total);
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json?.error?.message || "Upload failed"));
      } catch {
        reject(new Error("Invalid Cloudinary response"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    signal.addEventListener("abort", () => xhr.abort());

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", signed.apiKey);
    fd.append("timestamp", String(signed.timestamp));
    fd.append("signature", signed.signature);
    fd.append("folder", signed.folder);
    xhr.send(fd);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductEditor({
  initial,
  designerName,
}: {
  initial?: DashboardProductDetail | null;
  designerName: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [form, setForm] = useState<FormState>(() => toForm(initial));
  const [product, setProduct] = useState<DashboardProductDetail | null>(
    initial ?? null
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const standardCategorySlugs = useMemo(() => {
    return productCategoriesForGender(form.gender).map((c) => c.slug);
  }, [form.gender]);

  const standardSubcategorySlugs = useMemo(() => {
    return [
      ...COLLECTION_SUBCATEGORIES.map((c) => c.slug),
      ...STYLE_SUBCATEGORIES.map((c) => c.slug),
    ];
  }, []);

  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(() => {
    if (!form.category) return false;
    return !standardCategorySlugs.includes(form.category);
  });
  const [customCategoryText, setCustomCategoryText] = useState<string>(() => {
    if (!form.category) return "";
    return standardCategorySlugs.includes(form.category) ? "" : form.category;
  });

  const [isCustomSubcategory, setIsCustomSubcategory] = useState<boolean>(() => {
    if (!form.subcategory) return false;
    return !standardSubcategorySlugs.includes(form.subcategory);
  });
  const [customSubcategoryText, setCustomSubcategoryText] = useState<string>(() => {
    if (!form.subcategory) return "";
    return standardSubcategorySlugs.includes(form.subcategory) ? "" : form.subcategory;
  });

  const media = product?.media ?? [];

  const preview = useMemo(
    () => ({
      name: form.name,
      designerName,
      price: Number(form.price) || 0,
      mrp: form.mrp ? Number(form.mrp) : null,
      description: form.description,
      category: form.category,
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      colors: form.colors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      customizable: form.customizable,
      deliveryText: form.deliveryText,
      media,
      images: product?.images ?? [],
    }),
    [form, designerName, media, product?.images]
  );

  async function ensureSaved(): Promise<DashboardProductDetail> {
    const payload = formPayload(form);
    if (product?.id) {
      const updated = await updateDashboardProduct(product.id, payload);
      setProduct(updated);
      setForm(toForm(updated));
      return updated;
    }
    const created = await createDashboardProduct(payload);
    setProduct(created);
    setForm(toForm(created));
    router.replace(`/dashboard/products/${created.id}`);
    return created;
  }

  async function onSave(e?: FormEvent) {
    e?.preventDefault();
    setSaving(true);
    try {
      await ensureSaved();
      push("Product saved");
    } catch (err) {
      push(err instanceof Error ? err.message : "Save failed", "err");
    } finally {
      setSaving(false);
    }
  }

  async function onStatus(status: ProductStatus) {
    setSaving(true);
    try {
      const current = await ensureSaved();
      const updated = await setDashboardProductStatus(current.id, status);
      setProduct(updated);
      setForm(toForm(updated));
      push(`Status: ${status}`);
    } catch (err) {
      push(err instanceof Error ? err.message : "Status update failed", "err");
    } finally {
      setSaving(false);
    }
  }

  async function onUploadFiles(files: FileList | File[]) {
    setUploading(true);
    setProgress(0);
    let uploadedCount = 0;
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const current = await ensureSaved();
      const list = Array.from(files);
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const isVideo = file.type.startsWith("video/");
        try {
          const fd = new FormData();
          fd.append("file", file);

          const res = await fetch(`/api/dashboard/products/${current.id}/media/upload`, {
            method: "POST",
            body: fd,
            signal: controller.signal,
          });

          const json = await res.json();
          if (res.ok && json?.ok && json.data) {
            const updated = json.data as DashboardProductDetail;
            setProduct((prev) =>
              prev
                ? {
                    ...prev,
                    media: updated.media,
                    images: updated.media
                      .filter((m) => m.type === "image")
                      .map((m) => m.secureUrl),
                  }
                : updated
            );
            setForm(toForm(updated));
            uploadedCount++;
          } else {
            throw new Error(json?.error?.message || "Upload failed");
          }
        } catch (innerErr) {
          console.warn("Server upload fallback triggered:", innerErr);
          const dataUrl = await fileToDataUrl(file);
          const updated = await registerDashboardMedia(current.id, {
            type: isVideo ? "video" : "image",
            cloudinaryPublicId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            secureUrl: dataUrl,
          });
          setProduct((prev) =>
            prev
              ? {
                  ...prev,
                  media: updated.media,
                  images: updated.media
                    .filter((m) => m.type === "image")
                    .map((m) => m.secureUrl),
                }
              : updated
          );
          setForm(toForm(updated));
          uploadedCount++;
        }
        setProgress((i + 1) / list.length);
      }
      if (uploadedCount > 0) {
        push("Media uploaded successfully!", "ok");
      } else {
        push(
          "Upload failed. Check Cloudinary API credentials or try pasting a direct Image URL below.",
          "err"
        );
      }
    } catch (err) {
      if ((err as Error).message !== "Upload cancelled") {
        push(err instanceof Error ? err.message : "Upload failed", "err");
      }
    } finally {
      setUploading(false);
      setProgress(0);
      abortRef.current = null;
    }
  }

  async function onReorder(mediaIds: string[]) {
    if (!product) return;
    try {
      const updated = await reorderDashboardMedia(product.id, mediaIds);
      setProduct(updated);
    } catch (err) {
      push(err instanceof Error ? err.message : "Reorder failed", "err");
    }
  }

  async function onRemove(mediaId: string) {
    if (!product) return;
    try {
      const updated = await deleteDashboardMedia(product.id, mediaId);
      setProduct(updated);
      push("Media removed");
    } catch (err) {
      push(err instanceof Error ? err.message : "Delete failed", "err");
    }
  }

  const field =
    "mt-1 w-full rounded-xl border border-cloud bg-mist px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40";

  async function onAddViaUrl(url: string) {
    if (!url.trim()) return;
    try {
      const current = await ensureSaved();
      const updated = await registerDashboardMedia(current.id, {
        type: "image",
        cloudinaryPublicId: `url_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        secureUrl: url.trim(),
      });
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              media: updated.media,
              images: updated.media
                .filter((m) => m.type === "image")
                .map((m) => m.secureUrl),
            }
          : updated
      );
      setForm(toForm(updated));
      push("Direct Image URL added successfully", "ok");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to add Image URL", "err");
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      <form onSubmit={onSave} className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div>
            <h1 className="font-display text-3xl">
              {product ? "Edit product" : "New product"}
            </h1>
            <p className="text-sm text-stone mt-1">
              Status: <span className="text-charcoal">{form.status}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-charcoal text-paper px-4 py-2 text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => onStatus("draft")}
              className="rounded-full border border-cloud px-4 py-2 text-sm"
            >
              Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => onStatus("published")}
              className="rounded-full bg-gold/90 text-charcoal px-4 py-2 text-sm"
            >
              Publish
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => onStatus("archived")}
              className="rounded-full border border-cloud px-4 py-2 text-sm text-stone"
            >
              Archive
            </button>
          </div>
        </div>

        <section className="space-y-4 rounded-2xl border border-cloud bg-paper p-4 sm:p-5">
          <h2 className="text-xs tracking-label uppercase text-stone">1. Listing Classification &amp; Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, listingType: "COMMERCIAL" })}
              className={`p-3 rounded-xl border text-left transition-colors ${
                form.listingType === "COMMERCIAL"
                  ? "bg-charcoal text-paper border-charcoal"
                  : "bg-mist text-stone border-cloud"
              }`}
            >
              <span className="font-bold text-xs uppercase block">Commercial Item</span>
              <span className="text-[10px] opacity-80">Physical buyable inventory with price &amp; stock</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, listingType: "CONCEPT_ART" })}
              className={`p-3 rounded-xl border text-left transition-colors ${
                form.listingType === "CONCEPT_ART"
                  ? "bg-charcoal text-paper border-charcoal"
                  : "bg-mist text-stone border-cloud"
              }`}
            >
              <span className="font-bold text-xs uppercase block">Concept Art &amp; Runway</span>
              <span className="text-[10px] opacity-80">Prototype / Showcase (No stock required)</span>
            </button>
          </div>

          {form.listingType === "CONCEPT_ART" && (
            <div className="p-3 bg-gold/10 border border-gold/30 rounded-xl space-y-3">
              <label className="block">
                <span className="text-xs text-charcoal font-bold uppercase">Buyer Action CTA</span>
                <select
                  className={field}
                  value={form.conceptCta}
                  onChange={(e) => setForm({ ...form, conceptCta: e.target.value as any })}
                >
                  <option value="BESPOKE_INQUIRY">Request Custom Order / Bespoke Quote</option>
                  <option value="EXPRESS_INTEREST">Express Interest / Notify When Produced</option>
                  <option value="PRE_ORDER_DEPOSIT">Pre-Order Sample</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-stone">Estimated Launch Target (Optional)</span>
                <input
                  className={field}
                  placeholder="e.g. Expected Festive SS27"
                  value={form.estimatedLaunch}
                  onChange={(e) => setForm({ ...form, estimatedLaunch: e.target.value })}
                />
              </label>
            </div>
          )}

          <h2 className="text-xs tracking-label uppercase text-stone pt-2">2. Garment Details</h2>
          <label className="block">
            <span className="text-xs text-stone">Title</span>
            <input
              className={field}
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs text-stone">Description</span>
            <textarea
              className={field}
              required
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-stone">Gender</span>
              <select
                className={field}
                value={form.gender}
                onChange={(e) => {
                  const gender = e.target.value as FormState["gender"];
                  const allowed = productCategoriesForGender(gender).map((c) => c.slug);
                  const category = isCustomCategory ? form.category : allowed.includes(form.category) ? form.category : "";
                  setForm({ ...form, gender, category });
                }}
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="unisex">Unisex</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-stone">Product category</span>
              <select
                className={field}
                required
                value={isCustomCategory ? "other" : form.category}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "other") {
                    setIsCustomCategory(true);
                    const slug = customCategoryText.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
                    setForm({ ...form, category: slug || "" });
                  } else {
                    setIsCustomCategory(false);
                    setForm({ ...form, category: val });
                  }
                }}
              >
                <option value="" disabled>Select category</option>
                {productCategoriesForGender(form.gender).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
                <option value="other">✨ Other (Custom Category)...</option>
              </select>
              {isCustomCategory && (
                <input
                  type="text"
                  required
                  placeholder="Type custom category name (e.g. Waistcoats, Jackets, Kimonos)..."
                  className={`${field} mt-2 font-bold text-charcoal border-[#F6D746]`}
                  value={customCategoryText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setCustomCategoryText(text);
                    const slug = text.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
                    setForm({ ...form, category: slug });
                  }}
                />
              )}
            </label>
            <label className="block">
              <span className="text-xs text-stone">Sub-category</span>
              <select
                className={field}
                value={isCustomSubcategory ? "other" : form.subcategory}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "other") {
                    setIsCustomSubcategory(true);
                    const slug = customSubcategoryText.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
                    setForm({ ...form, subcategory: slug || "" });
                  } else {
                    setIsCustomSubcategory(false);
                    setForm({
                      ...form,
                      subcategory: val,
                      limitedEdition: val === "limited-design" ? true : form.limitedEdition,
                    });
                  }
                }}
              >
                <option value="">Standard collection</option>
                <optgroup label="Shop edits">
                  {COLLECTION_SUBCATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Style / occasion">
                  {STYLE_SUBCATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
                <option value="other">✨ Other (Custom Sub-category)...</option>
              </select>
              {isCustomSubcategory && (
                <input
                  type="text"
                  placeholder="Type custom sub-category name (e.g. Winter Edit, Resortwear)..."
                  className={`${field} mt-2 font-bold text-charcoal border-[#F6D746]`}
                  value={customSubcategoryText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setCustomSubcategoryText(text);
                    const slug = text.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
                    setForm({ ...form, subcategory: slug });
                  }}
                />
              )}
              <span className="text-[10px] text-stone mt-1 block">
                Use Latest Drop or Limited Design for homepage category rails.
              </span>
            </label>
            <label className="block">
              <span className="text-xs text-stone">Stock quantity</span>
              <input
                className={field}
                type="number"
                min={0}
                value={form.piecesRemaining}
                onChange={(e) =>
                  setForm({ ...form, piecesRemaining: e.target.value })
                }
              />
            </label>
          </div>

          {/* Automated Retail Pricing Calculator */}
          <div className="p-5 bg-mist/40 border border-cloud rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                🧮 Automated Retail Pricing Calculator
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                Free Shipping Enabled
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs text-stone font-bold">Base Garment Price (₹) *</span>
                <input
                  className={field}
                  type="number"
                  min={0}
                  placeholder="e.g. 80000"
                  value={form.basePrice}
                  onChange={(e) => {
                    const base = Number(e.target.value || 0);
                    const weight = Number(form.weightGrams || 800);
                    let ship = 150;
                    if (weight <= 500) ship = 100;
                    else if (weight <= 1000) ship = 150;
                    else if (weight <= 3000) ship = 250;
                    else ship = 400;

                    const gst = Math.round(base * 0.12);
                    const platform = Math.round(base * 0.10);
                    const computedTotal = base > 0 ? base + gst + ship + platform : 0;

                    setForm({
                      ...form,
                      basePrice: e.target.value,
                      price: computedTotal ? String(computedTotal) : form.price,
                    });
                  }}
                />
              </label>

              <label className="block">
                <span className="text-xs text-stone font-bold">MRP / Struck Price (₹)</span>
                <input
                  className={field}
                  type="number"
                  min={0}
                  placeholder="e.g. 110000"
                  value={form.mrp}
                  onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                />
              </label>
            </div>

            {/* Price Breakdown Calculation Display */}
            {Number(form.basePrice || 0) > 0 && (
              <div className="bg-white p-4 rounded-xl border border-cloud space-y-2 text-xs">
                <div className="flex justify-between text-stone">
                  <span>Base Garment Price</span>
                  <span className="font-mono font-semibold">₹{Number(form.basePrice).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>GST (12%)</span>
                  <span className="font-mono font-semibold">+ ₹{Math.round(Number(form.basePrice) * 0.12).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>Built-in Shipping Fee ({form.weightGrams || 800}g)</span>
                  <span className="font-mono font-semibold">
                    + ₹
                    {(() => {
                      const w = Number(form.weightGrams || 800);
                      if (w <= 500) return 100;
                      if (w <= 1000) return 150;
                      if (w <= 3000) return 250;
                      return 400;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>Platform Fee (10%)</span>
                  <span className="font-mono font-semibold">+ ₹{Math.round(Number(form.basePrice) * 0.10).toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-2 border-t border-cloud flex justify-between font-bold text-sm text-charcoal">
                  <span>LISTED RETAIL PRICE (Buyer Sees)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-stone">₹</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-28 text-right font-mono font-extrabold text-charcoal bg-mist border border-cloud rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <label className="block">
            <span className="text-xs text-stone">Sizes (comma-separated)</span>
            <input
              className={field}
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              placeholder="XS, S, M, L"
            />
          </label>
          <label className="block">
            <span className="text-xs text-stone">Colors (comma-separated)</span>
            <input
              className={field}
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
            />
          </label>

          {/* Size Chart Builder */}
          <div className="pt-2">
            <SizeChartBuilder
              value={form.sizeChart}
              onChange={(val) => setForm({ ...form, sizeChart: val })}
            />
          </div>

          {/* Legal Metrology & Shipping */}
          <div className="space-y-4 pt-4 border-t border-cloud">
            <h2 className="text-xs tracking-label uppercase text-stone">
              Legal Metrology &amp; Shipping Weight Compliance
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs text-stone">Item Shipping Weight (Grams) *</span>
                <input
                  className={field}
                  type="number"
                  placeholder="e.g. 800 (for 800g)"
                  value={form.weightGrams}
                  onChange={(e) => setForm({ ...form, weightGrams: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs text-stone">Net Quantity *</span>
                <input
                  className={field}
                  placeholder="1 Lehenga + 1 Blouse + 1 Dupatta"
                  value={form.netQuantity}
                  onChange={(e) => setForm({ ...form, netQuantity: e.target.value })}
                />
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs text-stone">Manufacturer / Brand Name *</span>
                <input
                  className={field}
                  placeholder="e.g. House of Atelier Pvt Ltd"
                  value={form.manufacturerName}
                  onChange={(e) => setForm({ ...form, manufacturerName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs text-stone">Country of Origin</span>
                <input
                  className={field}
                  value={form.countryOfOrigin}
                  onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })}
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs text-stone">Manufacturer Registered Address</span>
              <input
                className={field}
                placeholder="42 MI Road, Jaipur, Rajasthan 302001"
                value={form.manufacturerAddress}
                onChange={(e) => setForm({ ...form, manufacturerAddress: e.target.value })}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs text-stone">Tags (comma-separated)</span>
            <input
              className={field}
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs text-stone">Processing / delivery time</span>
            <input
              className={field}
              value={form.deliveryText}
              onChange={(e) =>
                setForm({ ...form, deliveryText: e.target.value })
              }
              placeholder="Ships in 10–14 days"
            />
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.customizable}
                onChange={(e) =>
                  setForm({ ...form, customizable: e.target.checked })
                }
              />
              Customization available
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.limitedEdition}
                onChange={(e) =>
                  setForm({ ...form, limitedEdition: e.target.checked })
                }
              />
              Limited edition
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-cloud bg-paper p-4 sm:p-5">
          <h2 className="text-xs tracking-label uppercase text-stone">
            Gallery
          </h2>
          <p className="text-sm text-stone">
            First item is the cover. Reorder with the arrows. Product is saved
            automatically before the first upload.
          </p>
          <MediaGalleryUploader
            media={media}
            onReorder={onReorder}
            onRemove={onRemove}
            onUploadFiles={onUploadFiles}
            onAddViaUrl={onAddViaUrl}
            uploading={uploading}
            progress={progress}
            onCancelUpload={() => abortRef.current?.abort()}
            disabled={saving}
          />
        </section>
      </form>

      <aside className="lg:sticky lg:top-20 h-fit">
        <ProductPreview product={preview} />
      </aside>
    </div>
  );
}
