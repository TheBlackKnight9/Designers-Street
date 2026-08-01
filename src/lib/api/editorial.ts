import { isRemoteApiEnabled } from "./catalog";
import {
  DEMO_CAMPAIGNS,
  DEMO_COLLECTIONS,
  DEMO_ARTICLES,
  DEMO_FEATURED_SECTIONS,
} from "@/lib/phase9-demo";
import type {
  EditorialCampaignData,
  EditorialCollectionData,
  EditorialArticleData,
  FeaturedSectionData,
} from "@/lib/types";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const payload = await res.json();
  if (payload.ok === false) throw new Error(payload.error || "API Error");
  return payload.data ?? payload;
}

export interface EditorialHomePayload {
  campaign: EditorialCampaignData | null;
  collections: EditorialCollectionData[];
  articles: EditorialArticleData[];
  sections: FeaturedSectionData[];
}

export async function fetchEditorialHome(): Promise<EditorialHomePayload> {
  if (!isRemoteApiEnabled()) {
    return {
      campaign: DEMO_CAMPAIGNS[0] ?? null,
      collections: DEMO_COLLECTIONS,
      articles: DEMO_ARTICLES,
      sections: DEMO_FEATURED_SECTIONS,
    };
  }
  try {
    return await getJson<EditorialHomePayload>("/api/editorial/home");
  } catch {
    return {
      campaign: DEMO_CAMPAIGNS[0] ?? null,
      collections: DEMO_COLLECTIONS,
      articles: DEMO_ARTICLES,
      sections: DEMO_FEATURED_SECTIONS,
    };
  }
}

export async function fetchEditorialCollection(
  slug: string
): Promise<EditorialCollectionData> {
  if (!isRemoteApiEnabled()) {
    const found = DEMO_COLLECTIONS.find((c) => c.slug === slug);
    if (found) return found;
    return DEMO_COLLECTIONS[0];
  }
  try {
    return await getJson<EditorialCollectionData>(
      `/api/editorial/collections/${encodeURIComponent(slug)}`
    );
  } catch {
    return DEMO_COLLECTIONS.find((c) => c.slug === slug) ?? DEMO_COLLECTIONS[0];
  }
}

export async function fetchEditorialArticle(
  slug: string
): Promise<EditorialArticleData> {
  if (!isRemoteApiEnabled()) {
    const found = DEMO_ARTICLES.find((a) => a.slug === slug);
    if (found) return found;
    return DEMO_ARTICLES[0];
  }
  try {
    return await getJson<EditorialArticleData>(
      `/api/editorial/articles/${encodeURIComponent(slug)}`
    );
  } catch {
    return DEMO_ARTICLES.find((a) => a.slug === slug) ?? DEMO_ARTICLES[0];
  }
}

export async function createAdminCampaign(data: Partial<EditorialCampaignData>) {
  const res = await fetch("/api/dashboard/editorial/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createAdminCollection(data: Partial<EditorialCollectionData>) {
  const res = await fetch("/api/dashboard/editorial/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createAdminArticle(data: Partial<EditorialArticleData>) {
  const res = await fetch("/api/dashboard/editorial/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function upsertAdminSection(data: Partial<FeaturedSectionData>) {
  const res = await fetch("/api/dashboard/editorial/sections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
