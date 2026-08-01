"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/lib/types";
import { isRemoteApiEnabled } from "@/lib/api/catalog";

const CART_KEY = "ds-cart";

interface CartContextValue {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "quantity">,
    options?: { openDrawer?: boolean }
  ) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  /** True if product (optionally size) is in the cart */
  isInCart: (productId: string, size?: string) => boolean;
  /** Total qty for a product (optionally a single size) */
  quantityFor: (productId: string, size?: string) => number;
  total: number;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  syncing: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

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
    throw new Error(body?.error?.message || "Cart request failed");
  }
  return body.data as T;
}

type CartPayload = { items: CartItem[]; total: number; itemCount: number };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const remote = isRemoteApiEnabled();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (remote) {
        try {
          const data = await apiJson<CartPayload>("/api/cart");
          if (!cancelled) setItems(data.items);
        } catch {
          try {
            const stored = localStorage.getItem(CART_KEY);
            if (stored && !cancelled) setItems(JSON.parse(stored));
          } catch {
            /* ignore */
          }
        }
      } else {
        try {
          const stored = localStorage.getItem(CART_KEY);
          if (stored && !cancelled) setItems(JSON.parse(stored));
        } catch {
          /* ignore */
        }
      }
      if (!cancelled) setHydrated(true);
    })();

    function onSync() {
      if (!remote) return;
      apiJson<CartPayload>("/api/cart")
        .then((data) => setItems(data.items))
        .catch(() => undefined);
    }
    window.addEventListener("ds:commerce-sync", onSync);
    return () => {
      cancelled = true;
      window.removeEventListener("ds:commerce-sync", onSync);
    };
  }, [remote]);

  useEffect(() => {
    if (!hydrated || remote) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated, remote]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, options?: { openDrawer?: boolean }) => {
      const openDrawer = options?.openDrawer !== false;
      const snapshot = items;
      // Optimistic update first — UI must reflect cart membership immediately
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productId === item.productId && i.size === item.size
        );
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId && i.size === item.size
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });
      if (openDrawer) setIsOpen(true);

      if (!remote) return;

      setSyncing(true);
      apiJson<CartPayload>("/api/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: item.productId,
          size: item.size,
          quantity: 1,
        }),
      })
        .then((data) => setItems(data.items))
        .catch(() => {
          // Rollback so checkout never diverges from server cart
          setItems(snapshot);
          if (openDrawer) setIsOpen(false);
        })
        .finally(() => setSyncing(false));
    },
    [remote, items]
  );

  const removeItem = useCallback(
    (productId: string, size: string) => {
      if (remote) {
        setSyncing(true);
        apiJson<CartPayload>(
          `/api/cart?productId=${encodeURIComponent(productId)}&size=${encodeURIComponent(size)}`,
          { method: "DELETE" }
        )
          .then((data) => setItems(data.items))
          .catch(() => {
            setItems((prev) =>
              prev.filter(
                (i) => !(i.productId === productId && i.size === size)
              )
            );
          })
          .finally(() => setSyncing(false));
        return;
      }
      setItems((prev) =>
        prev.filter((i) => !(i.productId === productId && i.size === size))
      );
    },
    [remote]
  );

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      if (remote) {
        setSyncing(true);
        apiJson<CartPayload>("/api/cart", {
          method: "PATCH",
          body: JSON.stringify({ productId, size, quantity }),
        })
          .then((data) => setItems(data.items))
          .catch(() => {
            if (quantity <= 0) {
              setItems((prev) =>
                prev.filter(
                  (i) => !(i.productId === productId && i.size === size)
                )
              );
            } else {
              setItems((prev) =>
                prev.map((i) =>
                  i.productId === productId && i.size === size
                    ? { ...i, quantity }
                    : i
                )
              );
            }
          })
          .finally(() => setSyncing(false));
        return;
      }
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter((i) => !(i.productId === productId && i.size === size))
        );
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity }
            : i
        )
      );
    },
    [remote]
  );

  const clearCart = useCallback(() => {
    if (remote) {
      apiJson<CartPayload>("/api/cart?all=1", { method: "DELETE" })
        .then((data) => setItems(data.items))
        .catch(() => setItems([]));
      return;
    }
    setItems([]);
  }, [remote]);

  const refreshCart = useCallback(async () => {
    if (!remote) return;
    try {
      const data = await apiJson<CartPayload>("/api/cart");
      setItems(data.items);
    } catch {
      /* keep current */
    }
  }, [remote]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const isInCart = useCallback(
    (productId: string, size?: string) =>
      items.some(
        (i) =>
          i.productId === productId &&
          (size === undefined || i.size === size)
      ),
    [items]
  );

  const quantityFor = useCallback(
    (productId: string, size?: string) =>
      items
        .filter(
          (i) =>
            i.productId === productId &&
            (size === undefined || i.size === size)
        )
        .reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      refreshCart,
      isInCart,
      quantityFor,
      total,
      itemCount,
      isOpen,
      openCart,
      closeCart,
      syncing,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      refreshCart,
      isInCart,
      quantityFor,
      total,
      itemCount,
      isOpen,
      openCart,
      closeCart,
      syncing,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
