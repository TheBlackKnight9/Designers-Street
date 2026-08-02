"use client";

import { useState } from "react";
import { useToast } from "@/components/dashboard/Toast";

export type MediaItem = {
  id?: string;
  url?: string;
  secureUrl?: string;
  kind?: "image" | "video";
  type?: "image" | "video";
  publicId?: string;
  cloudinaryPublicId?: string;
  thumbnailUrl?: string | null;
  displayOrder?: number;
};

type Props = {
  // Product Editor (Gallery Manager Mode)
  media?: MediaItem[];
  onReorder?: (mediaIds: string[]) => Promise<void>;
  onRemove?: (mediaId: string) => Promise<void>;
  onUploadFiles?: (files: FileList | File[]) => Promise<void>;
  onAddViaUrl?: (url: string) => Promise<void>;
  uploading?: boolean;
  progress?: number | null;
  onCancelUpload?: () => void;
  disabled?: boolean;

  // Standalone / Content Studio Mode
  onMediaAdded?: (item: { url: string; type?: "image" | "video"; publicId?: string }) => void;
  folder?: string;
  allowedTypes?: "all" | "image" | "video";
  label?: string;
};

export function MediaGalleryUploader({
  media,
  onReorder,
  onRemove,
  onUploadFiles,
  onAddViaUrl,
  uploading = false,
  progress,
  onCancelUpload,
  disabled = false,
  onMediaAdded,
  folder = "designer-studio",
  allowedTypes = "all",
  label = "Upload or Paste Media URL",
}: Props) {
  const { push } = useToast();
  const [tab, setTab] = useState<"file" | "url">("file");
  const [localUploading, setLocalUploading] = useState(false);
  const [directUrl, setDirectUrl] = useState("");

  // Mode 1: Standalone Single/Multi Media Upload (Posts, Stories)
  if (onMediaAdded && !media) {
    async function handleStandaloneUpload(file: File | null) {
      if (!file) return;
      const isVideo = file.type.startsWith("video/");
      if (allowedTypes === "image" && isVideo) {
        return push("Only image files are allowed", "err");
      }
      if (allowedTypes === "video" && !isVideo) {
        return push("Only video files are allowed", "err");
      }

      setLocalUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (res.ok && (data?.data?.url || data?.data?.secureUrl || data?.url)) {
          const url = data?.data?.secureUrl || data?.data?.url || data?.url;
          onMediaAdded?.({
            url,
            type: isVideo ? "video" : "image",
            publicId: data?.data?.cloudinaryPublicId || data?.publicId,
          });
          push("Media uploaded successfully!", "ok");
        } else {
          push(data?.error?.message || "Upload failed", "err");
        }
      } catch {
        push("Upload failed due to network error", "err");
      } finally {
        setLocalUploading(false);
      }
    }

    function handleStandaloneAddUrl(e: React.FormEvent) {
      e.preventDefault();
      const url = directUrl.trim();
      if (!url) return push("Please enter an image or video URL", "err");
      if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:")) {
        return push("URL must start with http:// or https://", "err");
      }

      const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("video");
      onMediaAdded?.({
        url,
        type: isVideo ? "video" : "image",
      });
      setDirectUrl("");
      push("Media link added!", "ok");
    }

    return (
      <div className="bg-white border border-cloud rounded-2xl p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-cloud pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
            {label}
          </span>
          <div className="flex bg-mist p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setTab("file")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                tab === "file" ? "bg-white text-charcoal shadow-xs" : "text-stone"
              }`}
            >
              📁 File Upload
            </button>
            <button
              type="button"
              onClick={() => setTab("url")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                tab === "url" ? "bg-white text-charcoal shadow-xs" : "text-stone"
              }`}
            >
              🔗 Image URL
            </button>
          </div>
        </div>

        {tab === "file" ? (
          <div className="border-2 border-dashed border-cloud rounded-xl p-6 text-center space-y-2 bg-mist/20">
            <span className="text-2xl">📸</span>
            <p className="text-xs font-bold text-charcoal">
              {localUploading ? "Uploading media..." : "Drag & drop or browse local files"}
            </p>
            <p className="text-[10px] text-stone">
              Supports JPG, PNG, WebP (Images) and MP4 (Videos)
            </p>
            <input
              type="file"
              accept={
                allowedTypes === "image"
                  ? "image/*"
                  : allowedTypes === "video"
                  ? "video/*"
                  : "image/*,video/*"
              }
              disabled={localUploading}
              onChange={(e) => handleStandaloneUpload(e.target.files?.[0] || null)}
              className="hidden"
              id={`media-file-input-${folder}`}
            />
            <label
              htmlFor={`media-file-input-${folder}`}
              className="inline-block px-4 py-2 bg-charcoal text-paper text-xs font-bold uppercase rounded-full cursor-pointer hover:bg-black transition-colors"
            >
              Select File
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
                Paste Direct Image / CDN URL
              </span>
              <div className="flex gap-2 mt-1">
                <input
                  type="url"
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleStandaloneAddUrl(e);
                    }
                  }}
                  placeholder="https://images.unsplash.com/photo-... or CDN link"
                  className="flex-1 rounded-xl border border-cloud bg-mist px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                />
                <button
                  type="button"
                  onClick={handleStandaloneAddUrl}
                  className="px-4 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase rounded-xl hover:bg-black transition-colors"
                >
                  Add Link
                </button>
              </div>
            </label>
            <p className="text-[10px] text-stone">
              💡 Supports Unsplash, Cloudinary, AWS S3, or any public HTTPS image link.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Mode 2: Product Gallery Manager (ProductEditor)
  const isBusy = uploading || disabled;
  const items = media || [];

  function move(from: number, to: number) {
    if (!onReorder || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    const ids = copy.map((m) => m.id).filter(Boolean) as string[];
    onReorder(ids);
  }

  async function handleAddUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!onAddViaUrl || !directUrl.trim()) return;
    try {
      await onAddViaUrl(directUrl.trim());
      setDirectUrl("");
    } catch {
      /* handled upstream */
    }
  }

  return (
    <div className="space-y-4">
      {/* File Dropzone */}
      <div className="border-2 border-dashed border-cloud rounded-2xl p-6 text-center space-y-2 bg-mist/20">
        <span className="text-2xl">📦</span>
        <p className="text-xs font-bold text-charcoal">
          {uploading ? `Uploading... ${progress ? `${progress}%` : ""}` : "Drag & drop gallery images or browse"}
        </p>
        <p className="text-[10px] text-stone">JPG, PNG, WebP (Max 10MB each)</p>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          disabled={isBusy}
          onChange={(e) => e.target.files?.length && onUploadFiles?.(e.target.files)}
          className="hidden"
          id="product-gallery-file-input"
        />
        <div className="flex justify-center gap-2 pt-1">
          <label
            htmlFor="product-gallery-file-input"
            className={`px-4 py-2 bg-charcoal text-paper text-xs font-bold uppercase rounded-full cursor-pointer hover:bg-black transition-colors ${
              isBusy ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Upload Gallery Files
          </label>
          {uploading && onCancelUpload && (
            <button
              type="button"
              onClick={onCancelUpload}
              className="px-3 py-2 border border-red-300 text-red-700 text-xs font-bold rounded-full"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Direct URL Form */}
      {onAddViaUrl && (
        <div className="flex gap-2 items-center pt-2">
          <input
            type="url"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrlSubmit(e);
              }
            }}
            placeholder="Or paste direct image URL (https://...)"
            className="flex-1 rounded-xl border border-cloud bg-mist px-3 py-2 text-xs outline-none"
          />
          <button
            type="button"
            onClick={handleAddUrlSubmit}
            disabled={!directUrl.trim() || isBusy}
            className="px-4 py-2 bg-charcoal text-paper text-xs font-bold uppercase rounded-xl disabled:opacity-50"
          >
            + Add URL
          </button>
        </div>
      )}

      {/* Media Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {items.map((item, idx) => {
            const itemUrl = item.secureUrl || item.url || "";
            return (
              <div
                key={item.id || itemUrl || idx}
                className="relative group aspect-square rounded-xl overflow-hidden border border-cloud bg-black/5 shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={itemUrl} alt="" className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-gold text-charcoal text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-xs">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => move(idx, idx - 1)}
                      className="p-1 bg-white text-charcoal rounded-lg font-bold text-xs"
                      title="Move Left / Make Cover"
                    >
                      ←
                    </button>
                  )}
                  {idx < items.length - 1 && (
                    <button
                      type="button"
                      onClick={() => move(idx, idx + 1)}
                      className="p-1 bg-white text-charcoal rounded-lg font-bold text-xs"
                      title="Move Right"
                    >
                      →
                    </button>
                  )}
                  {item.id && onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(item.id!)}
                      className="p-1 bg-red-600 text-white rounded-lg font-bold text-xs"
                      title="Delete Media"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
