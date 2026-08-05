/**
 * Client-safe Cloudinary delivery helpers.
 * Injects f_auto / q_auto / width transforms into Cloudinary URLs.
 * Non-Cloudinary URLs are returned unchanged (mock Unsplash, etc.).
 */

const CLOUDINARY_HOST = /res\.cloudinary\.com/i;

export function isCloudinaryUrl(url: string): boolean {
  try {
    return CLOUDINARY_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

function cloudNameFromEnv(): string | null {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    null
  );
}

/**
 * Insert transformation segment after `/upload/` in a Cloudinary delivery URL.
 */
export function withCloudinaryTransforms(
  url: string,
  transforms: string[],
  resourceType: "image" | "video" = "image"
): string {
  if (!url || transforms.length === 0) return url;
  if (!isCloudinaryUrl(url)) return url;

  const joined = transforms.filter(Boolean).join(",");
  const uploadMarker = `/${resourceType}/upload/`;
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) {
    // Try alternate resource type
    const alt = resourceType === "image" ? "video" : "image";
    const altMarker = `/${alt}/upload/`;
    const altIdx = url.indexOf(altMarker);
    if (altIdx === -1) return url;
    const after = url.slice(altIdx + altMarker.length);
    // Avoid double-inserting if transforms already present
    if (/^[a-z0-9_,./]+\/v\d+\//i.test(after) || after.startsWith(joined)) {
      return url;
    }
    return `${url.slice(0, altIdx + altMarker.length)}${joined}/${after}`;
  }

  const after = url.slice(idx + uploadMarker.length);
  if (after.startsWith(joined + "/") || after.startsWith(joined + ",")) {
    return url;
  }
  return `${url.slice(0, idx + uploadMarker.length)}${joined}/${after}`;
}

export function buildCloudinaryUrlFromPublicId(
  publicId: string,
  options: {
    type?: "image" | "video";
    width?: number;
    transforms?: string[];
  } = {}
): string | null {
  const cloud = cloudNameFromEnv();
  if (!cloud || !publicId) return null;
  const type = options.type ?? "image";
  const parts = ["f_auto", "q_auto", "c_limit"];
  if (options.width) parts.push(`w_${options.width}`);
  if (options.transforms) parts.push(...options.transforms);
  return `https://res.cloudinary.com/${cloud}/${type}/upload/${parts.join(",")}/${publicId}`;
}

export type DeliveryTier = "thumb" | "medium" | "full" | "stream";

const WIDTHS: Record<Exclude<DeliveryTier, "stream" | "full">, number> = {
  thumb: 160,
  medium: 1080,
};

/**
 * Optimized delivery URL for a given tier.
 * Prefer rewriting an existing Cloudinary delivery URL — seed `publicId`s
 * are often placeholders (demo/...) that do not exist on the CDN.
 */
export function getOptimizedMediaUrl(
  input: {
    url: string;
    publicId?: string | null;
    type?: "image" | "video";
  },
  tier: DeliveryTier = "medium"
): string {
  const type = input.type ?? "image";
  const { url, publicId } = input;
  const usablePublicId =
    publicId && !publicId.startsWith("demo/") && !isCloudinaryUrl(url)
      ? publicId
      : null;

  if (type === "video") {
    if (tier === "thumb") {
      if (usablePublicId) {
        const built = buildCloudinaryUrlFromPublicId(usablePublicId, {
          type: "video",
          transforms: ["so_0", "f_jpg", "q_auto", "w_400"],
        });
        if (built) return built;
      }
      return withCloudinaryTransforms(
        url,
        ["so_0", "f_jpg", "q_auto", "w_400"],
        "video"
      );
    }
    if (usablePublicId) {
      const built = buildCloudinaryUrlFromPublicId(usablePublicId, {
        type: "video",
        transforms: ["w_720", "c_limit", "q_auto:eco", "f_mp4", "vc_h264"],
      });
      if (built) return built;
    }
    return withCloudinaryTransforms(
      url,
      ["w_720", "c_limit", "q_auto:eco", "f_mp4", "vc_h264"],
      "video"
    );
  }

  // Images
  if (tier === "full") {
    if (usablePublicId) {
      const built = buildCloudinaryUrlFromPublicId(usablePublicId, {
        type: "image",
        transforms: ["f_auto", "q_auto"],
      });
      if (built) return built;
    }
    return withCloudinaryTransforms(url, ["f_auto", "q_auto"], "image");
  }

  const width = WIDTHS[tier === "thumb" ? "thumb" : "medium"];
  if (usablePublicId) {
    const built = buildCloudinaryUrlFromPublicId(usablePublicId, {
      type: "image",
      width,
    });
    if (built) return built;
  }
  return withCloudinaryTransforms(
    url,
    ["f_auto", "q_auto", "c_limit", `w_${width}`],
    "image"
  );
}
