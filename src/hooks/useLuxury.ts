"use client";

import { useCallback, useEffect, useState } from "react";
import type { LookbookData } from "@/lib/types";
import { listLookbooks, getLookbook } from "@/lib/api/luxury";
import { getLookbooksByDesigner, getLookbookBySlug } from "@/lib/phase8-demo";

export function useDesignerLookbooks(designerId?: string) {
  const [items, setItems] = useState<LookbookData[]>([]);
  const [loading, setLoading] = useState(Boolean(designerId));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!designerId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    listLookbooks(designerId)
      .then(setItems)
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load lookbooks");
        setItems(getLookbooksByDesigner(designerId));
      })
      .finally(() => setLoading(false));
  }, [designerId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, error, reload };
}

export function useLookbook(designerId?: string, slug?: string) {
  const [lookbook, setLookbook] = useState<LookbookData | null>(null);
  const [loading, setLoading] = useState(Boolean(designerId && slug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!designerId || !slug) {
      setLookbook(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    getLookbook(designerId, slug)
      .then((lb) => {
        if (!cancelled) {
          setLookbook(lb);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        const fallback = getLookbookBySlug(designerId, slug);
        if (fallback) {
          setLookbook(fallback);
          setLoading(false);
        } else {
          setError(e instanceof Error ? e.message : "Lookbook not found");
          setLookbook(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [designerId, slug]);

  return { lookbook, loading, error };
}
