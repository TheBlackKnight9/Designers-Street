import { RateLimitError } from "@/server/errors/rate-limit";

type BucketState = {
  count: number;
  windowStartMs: number;
};

/** In-memory fixed-window limiter (per process). Swap for Redis later if multi-instance. */
const buckets = new Map<string, BucketState>();

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** Max requests per window for public catalog GETs. */
export function publicRateLimitMax(): number {
  return parsePositiveInt(process.env.PUBLIC_API_RATE_LIMIT_MAX, 120);
}

/** Window length in seconds. */
export function publicRateLimitWindowSeconds(): number {
  return parsePositiveInt(process.env.PUBLIC_API_RATE_LIMIT_WINDOW_SEC, 60);
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Enforce a fixed-window rate limit for a named public route bucket.
 * Throws RateLimitError (429) when exceeded.
 */
export function enforcePublicRateLimit(
  request: Request,
  routeKey: string
): void {
  const max = publicRateLimitMax();
  const windowMs = publicRateLimitWindowSeconds() * 1000;
  const ip = clientIpFromRequest(request);
  const key = `${routeKey}:${ip}`;
  const now = Date.now();

  let state = buckets.get(key);
  if (!state || now - state.windowStartMs >= windowMs) {
    state = { count: 0, windowStartMs: now };
    buckets.set(key, state);
  }

  state.count += 1;

  if (state.count > max) {
    const retryAfterSeconds = Math.ceil(
      (state.windowStartMs + windowMs - now) / 1000
    );
    throw new RateLimitError(retryAfterSeconds, {
      route: routeKey,
      limit: max,
      windowSeconds: publicRateLimitWindowSeconds(),
    });
  }

  // Opportunistic prune to avoid unbounded growth in long-lived processes
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (now - v.windowStartMs >= windowMs * 2) buckets.delete(k);
    }
  }
}

/** Test helper — clear in-memory state. */
export function resetPublicRateLimitBuckets(): void {
  buckets.clear();
}
