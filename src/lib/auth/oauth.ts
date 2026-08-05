/**
 * Shared OAuth helpers for Google (and future providers).
 */

/** App origin used for OAuth redirectTo (browser or server). */
export function getAppOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "http://localhost:3000";
}

/**
 * Supabase redirectTo for Google OAuth.
 * Must be allow-listed in Supabase → Authentication → URL Configuration.
 */
export function getGoogleOAuthRedirectTo(nextPath = "/profile"): string {
  const next = nextPath.startsWith("/") ? nextPath : "/profile";
  return `${getAppOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
}

export const GOOGLE_OAUTH_OPTIONS = {
  queryParams: {
    access_type: "offline",
    prompt: "select_account",
  },
} as const;
