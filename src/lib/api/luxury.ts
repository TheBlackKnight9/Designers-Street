import type { LookbookData } from "@/lib/types";

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "");
  const res = await fetch(`${base}${path}`, {
    cache: "no-store",
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });
  const body = await res.json();
  if (!res.ok || body?.ok === false) {
    throw new Error(body?.error?.message || `Request failed: ${path}`);
  }
  return body.data as T;
}

export async function listLookbooks(designerId: string): Promise<LookbookData[]> {
  const data = await getJson<{ items: LookbookData[] }>(
    `/api/lookbooks?designerId=${encodeURIComponent(designerId)}`
  );
  return data.items ?? [];
}

export async function getLookbook(
  designerId: string,
  slug: string
): Promise<LookbookData> {
  return getJson<LookbookData>(
    `/api/lookbooks/${encodeURIComponent(designerId)}/${encodeURIComponent(slug)}`
  );
}

export async function createAppointment(input: {
  designerId: string;
  preferredDate: string;
  preferredTime: string;
  purpose: string;
  message?: string;
}) {
  return getJson("/api/appointments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createBespokeRequest(input: {
  designerId?: string;
  productId?: string;
  baseDesign?: string;
  fabric?: string;
  color?: string;
  embellishment?: string;
  size?: string;
  notes?: string;
  measurements?: Record<string, string>;
  referenceImages?: string[];
  budget?: number;
  occasion?: string;
  measurementSessionBooked?: boolean;
}) {
  return getJson("/api/bespoke", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: string,
  statusNotes?: string
) {
  return getJson(`/api/appointments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status, statusNotes }),
  });
}

export async function updateBespokeStatus(
  id: string,
  status: string,
  statusNotes?: string
) {
  return getJson(`/api/bespoke/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status, statusNotes }),
  });
}
