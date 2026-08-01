"use client";

import Image from "next/image";
import type { MediaRecord } from "@/server/types/media";

type Props = {
  media: MediaRecord[];
  onReorder: (orderedIds: string[]) => void;
  onRemove: (mediaId: string) => void;
  onUploadFiles: (files: FileList | File[]) => void;
  uploading?: boolean;
  progress?: number;
  onCancelUpload?: () => void;
  disabled?: boolean;
};

export function MediaGalleryUploader({
  media,
  onReorder,
  onRemove,
  onUploadFiles,
  uploading,
  progress,
  onCancelUpload,
  disabled,
}: Props) {
  function move(index: number, dir: -1 | 1) {
    const next = [...media];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    const tmp = next[index];
    next[index] = next[j];
    next[j] = tmp;
    onReorder(next.map((m) => m.id));
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (disabled || uploading) return;
          if (e.dataTransfer.files?.length) onUploadFiles(e.dataTransfer.files);
        }}
        className="rounded-2xl border border-dashed border-cloud bg-mist/50 px-4 py-8 text-center"
      >
        <p className="text-sm text-stone mb-3">
          Drag & drop images or videos, or choose files
        </p>
        <label className="inline-flex cursor-pointer rounded-full bg-charcoal text-paper px-4 py-2 text-sm">
          Choose files
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            multiple
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => {
              if (e.target.files?.length) onUploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {uploading && (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="h-2 rounded-full bg-cloud overflow-hidden">
              <div
                className="h-full bg-gold transition-all"
                style={{ width: `${Math.round((progress || 0) * 100)}%` }}
              />
            </div>
            <button
              type="button"
              onClick={onCancelUpload}
              className="mt-2 text-xs text-stone underline"
            >
              Cancel upload
            </button>
          </div>
        )}
      </div>

      {media.length === 0 ? (
        <p className="text-sm text-stone">No media yet. Add at least one image before publishing.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((item, index) => {
            const preview =
              item.type === "video"
                ? item.thumbnailUrl || item.secureUrl
                : item.secureUrl;
            return (
              <li
                key={item.id}
                className="relative rounded-xl overflow-hidden bg-mist border border-cloud aspect-[3/4]"
              >
                <Image
                  src={preview}
                  alt={item.altText || `Media ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 text-[10px] uppercase tracking-label bg-charcoal text-paper px-2 py-0.5 rounded-full">
                    Cover
                  </span>
                )}
                <span className="absolute top-2 right-2 text-[10px] uppercase tracking-label bg-paper/90 text-stone px-2 py-0.5 rounded-full">
                  {item.type}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex gap-1 p-2 bg-gradient-to-t from-black/50 to-transparent">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="flex-1 text-xs bg-paper/90 rounded-lg py-1 disabled:opacity-40"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={index === media.length - 1}
                    onClick={() => move(index, 1)}
                    className="flex-1 text-xs bg-paper/90 rounded-lg py-1 disabled:opacity-40"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="flex-1 text-xs bg-red-700 text-white rounded-lg py-1"
                  >
                    Del
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
