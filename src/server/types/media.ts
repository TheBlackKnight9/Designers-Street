import type { MediaAsset, MediaKind, MediaOwnerType } from "@prisma/client";

/** API DTO — stable for Product / Feed / Designer / Story consumers */
export type MediaRecord = {
  id: string;
  productId: string | null;
  postId: string | null;
  designerId: string | null;
  storyId: string | null;
  ownerType: MediaOwnerType;
  type: "image" | "video";
  cloudinaryPublicId: string;
  secureUrl: string;
  width: number | null;
  height: number | null;
  /** Video duration in milliseconds */
  duration: number | null;
  format: string | null;
  bytes: number | null;
  folder: string | null;
  altText: string | null;
  thumbnailUrl: string | null;
  displayOrder: number;
  createdAt: string;
};

export type MediaType = "image" | "video";

export type CreateMediaInput = {
  productId?: string | null;
  postId?: string | null;
  designerId?: string | null;
  storyId?: string | null;
  ownerType?: MediaOwnerType;
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
  uploadedById?: string | null;
};

export function kindToType(kind: MediaKind): MediaType {
  return kind === "video" ? "video" : "image";
}

export function typeToKind(type: MediaType): MediaKind {
  return type === "video" ? "video" : "image";
}

export function toMediaRecord(row: MediaAsset): MediaRecord {
  return {
    id: row.id,
    productId: row.productId,
    postId: row.postId,
    designerId: row.designerId,
    storyId: row.storyId,
    ownerType: row.ownerType,
    type: kindToType(row.kind),
    cloudinaryPublicId: row.publicId,
    secureUrl: row.url,
    width: row.width,
    height: row.height,
    duration: row.durationMs,
    format: row.format,
    bytes: row.bytes,
    folder: row.folder,
    altText: row.altText,
    thumbnailUrl: row.thumbnailUrl,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt.toISOString(),
  };
}

export function resolveOwnerType(input: {
  productId?: string | null;
  postId?: string | null;
  designerId?: string | null;
  storyId?: string | null;
  ownerType?: MediaOwnerType;
}): MediaOwnerType {
  if (input.ownerType) return input.ownerType;
  if (input.productId) return "product";
  if (input.postId) return "post";
  if (input.designerId) return "designer";
  if (input.storyId) return "story";
  return "unattached";
}
