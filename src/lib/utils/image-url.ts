const DEFAULT_PLACEHOLDER =
  "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80";

/**
 * Validates and sanitizes image URLs for Next.js <Image /> and standard <img> tags.
 * Prevents broken image icons when stored URLs are empty, invalid, or relative.
 */
export function sanitizeImageUrl(
  url?: string | null,
  fallback = DEFAULT_PLACEHOLDER
): string {
  if (!url || typeof url !== "string") return fallback;
  const clean = url.trim();

  if (
    clean === "" ||
    clean.toLowerCase() === "na" ||
    clean.toLowerCase() === "n/a" ||
    clean.toLowerCase() === "undefined" ||
    clean.toLowerCase() === "null" ||
    clean.toLowerCase().includes("null font-mono")
  ) {
    return fallback;
  }

  // Valid image URL formats
  if (
    clean.startsWith("/") ||
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }

  // Handle relative paths without leading slash
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
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  );
}
