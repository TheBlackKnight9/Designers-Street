/**
 * Phase 2 will enable `src/middleware.ts` using these helpers.
 * Intentionally not registered in Phase 1 so request behavior is unchanged.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  getSessionUserFromCookieHeader,
  SESSION_COOKIE_NAME,
} from "@/server/auth";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

/**
 * Example matcher config for future middleware.ts:
 * export const config = { matcher: ["/admin/:path*", "/dashboard/:path*", "/api/auth/:path*"] }
 */
export async function authMiddlewarePreview(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const user = await getSessionUserFromCookieHeader(
    request.headers.get("cookie")
  );

  if (!user) {
    const login = new URL("/profile", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  // Role checks belong in route handlers / Phase 2 UI — keep middleware thin.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ds-user-id", user.id);
  requestHeaders.set("x-ds-user-role", user.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const authMiddlewareCookieName = SESSION_COOKIE_NAME;
