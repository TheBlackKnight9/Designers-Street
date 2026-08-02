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
  /** Returns false when the guest was redirected to sign in */
  toggle: (productId: string) => boolean;
  count: number;
  signedIn: boolean;
  hydrated: boolean;
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

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const next = `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams({
    next,
    notice: "wishlist_login_required",
  });
  window.location.href = `/account/login?${params.toString()}`;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const remote = isRemoteApiEnabled();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Keep any leftover guest ids only so they can merge after login
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
          // Guest: favorites require login (same rule as checkout)
          if (!cancelled) {
            setSignedIn(false);
            setIds([]);
          }
        }
      } else {
        // Mock mode still supports local-only wishlist
        if (!cancelled) {
          setSignedIn(false);
          setIds(localIds);
        }
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [remote]);

  useEffect(() => {
    if (!hydrated) return;
    if (remote) return; // never persist guest favorites when API is on
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  }, [ids, hydrated, remote]);

  const isWished = useCallback(
    (productId: string) => ids.includes(productId),
    [ids]
  );

  const toggle = useCallback(
    (productId: string): boolean => {
      // Production / API mode: sign-in required, like checkout
      if (remote && !signedIn) {
        redirectToLogin();
        return false;
      }

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
          .catch((err) => {
            setIds(prev);
            const msg = err instanceof Error ? err.message : "";
            if (/sign in|unauthor|auth|session/i.test(msg)) {
              redirectToLogin();
            }
          });
        return true;
      }

      // Mock / offline mode
      setIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
      return true;
    },
    [remote, signedIn, ids]
  );

  const count = ids.length;

  const value = useMemo(
    () => ({ ids, isWished, toggle, count, signedIn, hydrated }),
    [ids, isWished, toggle, count, signedIn, hydrated]
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
