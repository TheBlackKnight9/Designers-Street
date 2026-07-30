import type {
  MediaAnalyticsEvent,
  MediaAnalyticsPayload,
} from "@/lib/media/types";

/**
 * Noop analytics façade — swap body later without refactoring the viewer.
 */
export function trackMediaEvent(
  event: MediaAnalyticsEvent,
  payload?: MediaAnalyticsPayload
): void {
  void event;
  void payload;
  // Extension point: wire vendor / pipeline here in a later phase.
}
