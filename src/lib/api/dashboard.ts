import type { MediaRecord } from "@/server/types/media";
import type { Product } from "@/lib/types";
import type { ProductStatus } from "@prisma/client";

export type DashboardProductDetail = Product & {
  status: ProductStatus;
  media: MediaRecord[];
};

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = await res.json();
  if (!res.ok || body?.ok === false) {
    throw new Error(body?.error?.message || `Request failed: ${path}`);
  }
  return body.data as T;
}

export async function fetchDashboardMe() {
  return getJson<{
    user: { id: string; email: string; name: string | null };
    designer: {
      id: string;
      name: string;
      handle: string;
      logo: string;
      banner: string;
      bio: string;
      foundingStory?: string;
      location?: string;
      website?: string | null;
      offersBespoke?: boolean;
    };
  }>("/api/auth/me");
}

export async function listDashboardProducts(status?: ProductStatus) {
  const q = status ? `?status=${status}` : "";
  return getJson<{
    products: (Product & { status?: ProductStatus })[];
    counts: {
      draft: number;
      published: number;
      archived: number;
      total: number;
    };
  }>(`/api/dashboard/products${q}`);
}

export async function getDashboardProduct(id: string) {
  return getJson<DashboardProductDetail>(
    `/api/dashboard/products/${encodeURIComponent(id)}`
  );
}

export async function createDashboardProduct(input: Record<string, unknown>) {
  return getJson<DashboardProductDetail>("/api/dashboard/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateDashboardProduct(
  id: string,
  input: Record<string, unknown>
) {
  return getJson<DashboardProductDetail>(
    `/api/dashboard/products/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(input) }
  );
}

export async function deleteDashboardProduct(id: string) {
  return getJson<{ id: string; deleted: true }>(
    `/api/dashboard/products/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export async function setDashboardProductStatus(
  id: string,
  status: ProductStatus
) {
  return getJson<DashboardProductDetail>(
    `/api/dashboard/products/${encodeURIComponent(id)}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export async function reorderDashboardMedia(id: string, mediaIds: string[]) {
  return getJson<DashboardProductDetail>(
    `/api/dashboard/products/${encodeURIComponent(id)}/media/order`,
    { method: "PUT", body: JSON.stringify({ mediaIds }) }
  );
}

export async function registerDashboardMedia(
  productId: string,
  input: Record<string, unknown>
) {
  return getJson<DashboardProductDetail>(
    `/api/dashboard/products/${encodeURIComponent(productId)}/media`,
    { method: "POST", body: JSON.stringify(input) }
  );
}

export async function deleteDashboardMedia(productId: string, mediaId: string) {
  return getJson<DashboardProductDetail>(
    `/api/dashboard/products/${encodeURIComponent(productId)}/media/${encodeURIComponent(mediaId)}`,
    { method: "DELETE" }
  );
}

export async function signDashboardUpload(options?: {
  ownerType?: "product" | "designer";
  resourceType?: "image" | "video" | "auto";
}) {
  return getJson<{
    cloudName: string;
    apiKey: string;
    timestamp: number;
    folder: string;
    signature: string;
    resourceType: string;
  }>("/api/dashboard/media/sign", {
    method: "POST",
    body: JSON.stringify(options || { ownerType: "product" }),
  });
}

export async function updateDashboardProfile(input: Record<string, unknown>) {
  return getJson<{ designer: Record<string, unknown> }>(
    "/api/dashboard/profile",
    { method: "PUT", body: JSON.stringify(input) }
  );
}
