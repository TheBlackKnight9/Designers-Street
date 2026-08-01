/**
 * Allow only same-origin relative paths for post-login redirects.
 * Rejects protocol-relative (`//evil`), schemes, and query injection via path.
 */
export function safeInternalPath(
  next: string | null | undefined,
  fallback = "/profile"
): string {
  if (!next || typeof next !== "string") return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  // Path only — drop open-redirect tricks like /\\evil or /%2f%2f
  if (!/^\/[\w\-./@%]*$/.test(trimmed.split("?")[0] || "")) return fallback;
  return trimmed;
}
