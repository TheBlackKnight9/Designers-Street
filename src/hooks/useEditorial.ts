"use client";

import { useEffect, useState } from "react";
import {
  fetchEditorialHome,
  fetchEditorialCollection,
  fetchEditorialArticle,
  type EditorialHomePayload,
} from "@/lib/api/editorial";
import type {
  EditorialCollectionData,
  EditorialArticleData,
} from "@/lib/types";

export function useEditorialHome() {
  const [data, setData] = useState<EditorialHomePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchEditorialHome()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load editorial");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

export function useEditorialCollection(slug: string) {
  const [collection, setCollection] = useState<EditorialCollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchEditorialCollection(slug)
      .then((res) => {
        if (!cancelled) {
          setCollection(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load collection");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { collection, loading, error };
}

export function useEditorialArticle(slug: string) {
  const [article, setArticle] = useState<EditorialArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchEditorialArticle(slug)
      .then((res) => {
        if (!cancelled) {
          setArticle(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load article");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { article, loading, error };
}
