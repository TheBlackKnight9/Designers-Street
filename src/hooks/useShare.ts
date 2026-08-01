"use client";

import { useCallback, useState } from "react";

type SharePayload = {
  title: string;
  text?: string;
  url: string;
};

export function useShare() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const share = useCallback(async (payload: SharePayload) => {
    setError(null);
    const url =
      typeof window !== "undefined" && payload.url.startsWith("/")
        ? `${window.location.origin}${payload.url}`
        : payload.url;

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url,
        });
        return { method: "native" as const };
      } catch {
        /* fall through to copy */
      }
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      return { method: "clipboard" as const };
    } catch {
      setError("Could not copy link");
      return { method: "failed" as const };
    }
  }, []);

  return { share, copied, error };
}
