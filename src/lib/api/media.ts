import type { MediaRecord, MediaType } from "@/server/types/media";
import type { SignedUploadParams } from "@/server/media/cloudinary";

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "");
  const res = await fetch(`${base}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(init?.headers || {}),
    },
  });
  const body = await res.json();
  if (!res.ok || body?.ok === false) {
    throw new Error(body?.error?.message || `Request failed: ${path}`);
  }
  return body.data as T;
}

/** Request signed Cloudinary upload params (API secret never exposed). */
export async function createMediaUploadSignature(options?: {
  folder?: string;
  ownerType?: "product" | "post" | "designer" | "story" | "unattached";
  resourceType?: "image" | "video" | "auto";
}): Promise<SignedUploadParams> {
  return getJson("/api/media/upload", {
    method: "POST",
    body: JSON.stringify({
      intent: "sign",
      folder: options?.folder,
      ownerType: options?.ownerType,
      resourceType: options?.resourceType ?? "auto",
    }),
  });
}

/** Persist Cloudinary result metadata after a signed client upload. */
export async function registerMedia(input: {
  type: MediaType;
  cloudinaryPublicId: string;
  secureUrl: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  format?: string | null;
  bytes?: number | null;
  folder?: string | null;
  altText?: string | null;
  thumbnailUrl?: string | null;
  displayOrder?: number | null;
  productId?: string | null;
  postId?: string | null;
  designerId?: string | null;
  storyId?: string | null;
  ownerType?: string;
}): Promise<MediaRecord> {
  return getJson("/api/media/upload", {
    method: "POST",
    body: JSON.stringify({ intent: "register", ...input }),
  });
}

export async function getMedia(id: string): Promise<MediaRecord> {
  return getJson(`/api/media/${encodeURIComponent(id)}`);
}

export async function deleteMedia(id: string): Promise<{ id: string; deleted: true }> {
  return getJson(`/api/media/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** Server-side multipart upload helper (browser FormData). */
export async function uploadMediaFile(
  formData: FormData
): Promise<MediaRecord> {
  const base = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "");
  const res = await fetch(`${base}/api/media/upload`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });
  const body = await res.json();
  if (!res.ok || body?.ok === false) {
    throw new Error(body?.error?.message || "Media upload failed");
  }
  return body.data as MediaRecord;
}
