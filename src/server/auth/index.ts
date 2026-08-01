import { AuthService, SESSION_COOKIE_NAME } from "@/server/auth/session";
import type { SessionUser } from "@/server/types";

/**
 * Middleware-oriented helpers (Phase 2 will call these from middleware.ts).
 * No middleware file is activated in Phase 1 to avoid changing request behavior.
 */
export async function getSessionUserFromCookieHeader(
  cookieHeader: string | null
): Promise<SessionUser | null> {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return null;
  const token = decodeURIComponent(match.split("=").slice(1).join("="));
  return new AuthService().resolveSession(token);
}

export function buildSessionCookie(token: string, expiresAt: Date): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export type { SessionUser };
export {
  AuthService,
  SESSION_COOKIE_NAME,
  createSessionToken,
  hashSessionToken,
  getAuthSecret,
} from "@/server/auth/session";
export * from "@/server/auth/permissions";
export {
  createSupabaseBrowserClient,
  createSupabaseServiceClient,
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/server/auth/supabase";
export {
  requireDashboardContext,
  ensureDesignerAccount,
  type DashboardContext,
} from "@/server/auth/dashboard-session";
export {
  ensureBuyerAccount,
  getOptionalAuthUser,
  requireAuthUser,
  requireBuyerContext,
} from "@/server/auth/buyer-session";
