"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
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
import { useToast } from "./Toast";
import type { ProductStatus } from "@prisma/client";

type FormState = {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: string;
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
};

function toForm(p?: DashboardProductDetail | null): FormState {
  return {
    name: p?.name ?? "",
    description: p?.description ?? "",
    category: p?.category ?? "",
    subcategory: p?.subcategory ?? "",
    price: p?.price != null ? String(p.price) : "",
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
  };
}

function formPayload(form: FormState) {
  return {
    name: form.name,
    description: form.description,
    category: form.category,
    subcategory: form.subcategory || null,
    price: Number(form.price),
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
    }),
    [form, designerName, media]
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
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const current = await ensureSaved();
      const list = Array.from(files);
      for (const file of list) {
        const isVideo = file.type.startsWith("video/");
        const signed = await signDashboardUpload({
          ownerType: "product",
          resourceType: isVideo ? "video" : "image",
        });
        const result = await uploadToCloudinary(
          file,
          signed,
          controller.signal,
          setProgress
        );
        const updated = await registerDashboardMedia(current.id, {
          type: isVideo ? "video" : "image",
          cloudinaryPublicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          duration:
            typeof result.duration === "number"
              ? Math.round(result.duration * 1000)
              : null,
          format: result.format,
          bytes: result.bytes,
          folder: result.folder || signed.folder,
        });
        setProduct(updated);
      }
      push("Media uploaded");
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
          <h2 className="text-xs tracking-label uppercase text-stone">Details</h2>
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
              <span className="text-xs text-stone">Category</span>
              <input
                className={field}
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="lehengas, sarees…"
              />
            </label>
            <label className="block">
              <span className="text-xs text-stone">Subcategory</span>
              <input
                className={field}
                value={form.subcategory}
                onChange={(e) =>
                  setForm({ ...form, subcategory: e.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="text-xs text-stone">Price (₹)</span>
              <input
                className={field}
                required
                type="number"
                min={1}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs text-stone">MRP (₹)</span>
              <input
                className={field}
                type="number"
                min={0}
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs text-stone">Gender</span>
              <select
                className={field}
                value={form.gender}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gender: e.target.value as FormState["gender"],
                  })
                }
              >
                <option value="unisex">Unisex</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
              </select>
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
