import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run middleware ONLY on routes that require authentication gating or session updates.
     * Public routes (home, catalog, product details, feed, static files) bypass Edge Auth network calls
     * to prevent Vercel 504 MIDDLEWARE_INVOCATION_TIMEOUT.
     */
    "/admin/:path*",
    "/dashboard/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/wishlist",
  ],
};
