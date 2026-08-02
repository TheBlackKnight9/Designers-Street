const DEFAULT_PLACEHOLDER =
  "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80";

/**
 * Validates and sanitizes image URLs for Next.js <Image /> component.
 * Prevents "Failed to parse src 'na' on next/image" and "Failed to construct 'URL': Invalid URL" errors.
 */
export function sanitizeImageUrl(
  url?: string | null,
  fallback = DEFAULT_PLACEHOLDER
): string {
  if (!url || typeof url !== "string") return fallback;
  const clean = url.trim();

  // Common invalid string values stored in DB or form defaults
  if (
    clean === "" ||
    clean.toLowerCase() === "na" ||
    clean.toLowerCase() === "n/a" ||
    clean.toLowerCase() === "undefined" ||
    clean.toLowerCase() === "null font-mono" ||
    clean.toLowerCase() === "null"
  ) {
    return fallback;
  }

  // Valid formats for next/image
  if (
    clean.startsWith("/") ||
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:image/")
  ) {
    return clean;
  }

  // If missing leading slash for relative paths (e.g. "images/sample.jpg")
  if (!clean.includes("://") && !clean.startsWith("/")) {
    return `/${clean}`;
  }

  return fallback;
}

export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.trim().toLowerCase();
  if (
    clean === "" ||
    clean === "na" ||
    clean === "n/a" ||
    clean === "undefined" ||
    clean === "null"
  ) {
    return false;
  }
  return (
    clean.startsWith("/") ||
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:image/")
  );
}
