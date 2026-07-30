import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeInternalPath } from "@/lib/safe-redirect";

function getPublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Refresh Supabase auth cookies and gate protected routes.
 * Designer: /dashboard, /login, /signup
 * Buyer: /account/login|signup (no force-redirect to dashboard)
 * Checkout/orders require auth when hitting those paths.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getPublishableKey();
  const path = request.nextUrl.pathname;

  const needsBuyerAuth =
    path.startsWith("/checkout") ||
    path.startsWith("/orders") ||
    path === "/account/settings" ||
    path === "/account/addresses";

  if (!url || !key) {
    if (path.startsWith("/dashboard")) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/login";
      redirect.searchParams.set("error", "supabase_not_configured");
      return NextResponse.redirect(redirect);
    }
    if (needsBuyerAuth) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/account/login";
      redirect.searchParams.set("next", path);
      redirect.searchParams.set("error", "supabase_not_configured");
      return NextResponse.redirect(redirect);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = path.startsWith("/dashboard");
  const isBuyerAuth =
    path === "/account/login" ||
    path === "/account/signup" ||
    path === "/account/forgot-password" ||
    path === "/account/reset-password";

  if (isDashboard && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  if (needsBuyerAuth && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/account/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  // Do not auto-redirect authenticated users away from designer login/signup.
  // Buyers must not be forced into /dashboard (which would fail authz).
  // Designer login/signup handle post-auth navigation themselves.

  if (
    isBuyerAuth &&
    user &&
    (path === "/account/login" || path === "/account/signup")
  ) {
    const next = safeInternalPath(
      request.nextUrl.searchParams.get("next"),
      "/profile"
    );
    const redirect = request.nextUrl.clone();
    redirect.pathname = next.split("?")[0] || "/profile";
    redirect.search = next.includes("?")
      ? next.slice(next.indexOf("?"))
      : "";
    // Only allow search on known internal paths — clear for safety
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return supabaseResponse;
}
