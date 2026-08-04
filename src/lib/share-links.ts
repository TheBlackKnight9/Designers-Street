export type SharePayload = {
  title: string;
  text?: string;
  url: string;
};

export function resolveShareUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window !== "undefined") {
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${window.location.origin}${path}`;
  }
  return url;
}

export function buildShareMessage(payload: SharePayload): string {
  const absolute = resolveShareUrl(payload.url);
  const parts = [payload.text, absolute].filter(Boolean);
  return parts.join(" ");
}

export function buildWhatsAppShareUrl(payload: SharePayload): string {
  return `https://wa.me/?text=${encodeURIComponent(buildShareMessage(payload))}`;
}

export function buildEmailShareUrl(payload: SharePayload): string {
  const absolute = resolveShareUrl(payload.url);
  const body = payload.text
    ? `${payload.text}\n\n${absolute}`
    : absolute;
  return `mailto:?subject=${encodeURIComponent(payload.title)}&body=${encodeURIComponent(body)}`;
}

export function buildFacebookShareUrl(payload: SharePayload): string {
  const absolute = resolveShareUrl(payload.url);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absolute)}`;
}

export function buildTwitterShareUrl(payload: SharePayload): string {
  const absolute = resolveShareUrl(payload.url);
  const text = payload.text || payload.title;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(absolute)}`;
}

export function buildTelegramShareUrl(payload: SharePayload): string {
  const absolute = resolveShareUrl(payload.url);
  const text = payload.text || payload.title;
  return `https://t.me/share/url?url=${encodeURIComponent(absolute)}&text=${encodeURIComponent(text)}`;
}

export async function copyShareLink(url: string): Promise<boolean> {
  const absolute = resolveShareUrl(url);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(absolute);
      return true;
    }
  } catch {
    /* fall through */
  }
  return false;
}

export async function nativeShare(payload: SharePayload): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  const absolute = resolveShareUrl(payload.url);
  try {
    await navigator.share({
      title: payload.title,
      text: payload.text,
      url: absolute,
    });
    return true;
  } catch {
    return false;
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}
