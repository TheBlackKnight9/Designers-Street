import type { MediaOwnerType } from "@prisma/client";

/** Cloudinary folder root for this app */
export const MEDIA_FOLDER_ROOT = "designers-street";

/**
 * Organized delivery folders:
 *   designers-street/products
 *   designers-street/posts
 *   designers-street/stories
 *   designers-street/designers
 *   designers-street/unattached
 */
export const MEDIA_FOLDERS = {
  product: `${MEDIA_FOLDER_ROOT}/products`,
  post: `${MEDIA_FOLDER_ROOT}/posts`,
  story: `${MEDIA_FOLDER_ROOT}/stories`,
  designer: `${MEDIA_FOLDER_ROOT}/designers`,
  unattached: `${MEDIA_FOLDER_ROOT}/unattached`,
} as const satisfies Record<MediaOwnerType, string>;

export function resolveMediaFolder(
  ownerType?: MediaOwnerType | null,
  explicitFolder?: string | null
): string {
  if (explicitFolder?.trim()) return explicitFolder.trim();
  if (ownerType && ownerType in MEDIA_FOLDERS) {
    return MEDIA_FOLDERS[ownerType];
  }
  return MEDIA_FOLDERS.unattached;
}
