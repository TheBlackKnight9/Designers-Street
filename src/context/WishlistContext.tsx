"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isRemoteApiEnabled } from "@/lib/api/catalog";

const WISHLIST_KEY = "ds-wishlist";

interface WishlistContextValue {
  ids: string[];
  isWished: (productId: string) => boolean;
  toggle: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = await res.json();
  if (!res.ok || body?.ok === false) {
    throw new Error(body?.error?.message || "Wishlist request failed");
  }
  return body.data as T;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const remote = isRemoteApiEnabled();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Always hydrate guest local first
      let localIds: string[] = [];
      try {
        const stored = localStorage.getItem(WISHLIST_KEY);
        if (stored) localIds = JSON.parse(stored);
      } catch {
        /* ignore */
      }

      if (remote) {
        try {
          const data = await apiJson<{ ids: string[] }>("/api/wishlist");
          if (!cancelled) {
            setSignedIn(true);
            setIds(data.ids);
            // Merge any leftover guest ids once
            if (localIds.length) {
              const merged = await apiJson<{ ids: string[] }>(
                "/api/wishlist/merge",
                {
                  method: "POST",
                  body: JSON.stringify({ productIds: localIds }),
                }
              );
              if (!cancelled) {
                setIds(merged.ids);
                localStorage.removeItem(WISHLIST_KEY);
              }
            }
          }
        } catch {
          if (!cancelled) {
            setSignedIn(false);
            setIds(localIds);
          }
        }
      } else if (!cancelled) {
        setIds(localIds);
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [remote]);

  useEffect(() => {
    if (!hydrated) return;
    if (remote && signedIn) return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  }, [ids, hydrated, remote, signedIn]);

  const isWished = useCallback(
    (productId: string) => ids.includes(productId),
    [ids]
  );

  const toggle = useCallback(
    (productId: string) => {
      if (remote && signedIn) {
        const prev = ids;
        const optimistic = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [productId, ...prev];
        setIds(optimistic);
        apiJson<{ ids: string[]; wished: boolean }>("/api/wishlist", {
          method: "POST",
          body: JSON.stringify({ productId }),
        })
          .then((data) => setIds(data.ids))
          .catch(() => setIds(prev));
        return;
      }
      setIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
    },
    [remote, signedIn, ids]
  );

  const count = ids.length;

  const value = useMemo(
    () => ({ ids, isWished, toggle, count }),
    [ids, isWished, toggle, count]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
