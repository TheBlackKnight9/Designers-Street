import type {
  MediaAnalyticsEvent,
  MediaAnalyticsPayload,
} from "@/lib/media/types";

const RING_MAX = 200;
const STORAGE_KEY = "ds-reel-analytics";

export type AnalyticsRecord = {
  event: MediaAnalyticsEvent;
  payload?: MediaAnalyticsPayload;
  at: number;
};

let ring: AnalyticsRecord[] = [];

function persist(record: AnalyticsRecord) {
  if (typeof window === "undefined") return;
  try {
    const prev = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || "[]"
    ) as AnalyticsRecord[];
    const next = [...prev, record].slice(-RING_MAX);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Analytics façade — buffers events for future pipelines / recommendations.
 * Does not require AI; safe no-op if storage unavailable.
 */
export function trackMediaEvent(
  event: MediaAnalyticsEvent,
  payload?: MediaAnalyticsPayload
): void {
  const record: AnalyticsRecord = { event, payload, at: Date.now() };
  ring = [...ring.slice(-(RING_MAX - 1)), record];
  persist(record);
  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined"
  ) {
    // eslint-disable-next-line no-console
    console.debug("[ds-analytics]", event, payload ?? {});
  }
}

export function getBufferedAnalytics(): AnalyticsRecord[] {
  return [...ring];
}

export function readPersistedAnalytics(): AnalyticsRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
