/**
 * Extension points for future analytics — no-op in Phase 4.
 */
export type PublicAnalyticsEvent =
  | "product_viewed"
  | "feed_viewed"
  | "category_viewed"
  | "designer_viewed";

export function trackPublicEvent(
  _event: PublicAnalyticsEvent,
  _payload?: Record<string, unknown>
): void {
  /* intentionally empty — wire to analytics later */
}
