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
 * Role-based Separation Rules:
 * 1. Buyer accessing Designer Dashboard (/dashboard/*): Redirect to /designer-portal?notice=designers_only
 * 2. Logged-in Designer accessing Buyer Auth (/account/login, /account/signup): Redirect to /dashboard
 * 3. Logged-in Buyer accessing Buyer Auth (/account/login, /account/signup): Redirect to /profile or ?next=
 * 4. Admin (User.role === 'admin'): Unrestricted access
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
    path === "/account/addresses" ||
    path === "/profile/addresses";

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

  // Check user role from metadata or default to buyer
  const userRole = (user?.user_metadata?.role as string) || (user?.app_metadata?.role as string) || "buyer";

  // 1. Gating Designer Dashboard (/dashboard/*)
  if (isDashboard) {
    if (!user) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/login";
      redirect.searchParams.set("next", path);
      return NextResponse.redirect(redirect);
    }
    if (userRole === "buyer") {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/designer-portal";
      redirect.searchParams.set("notice", "designers_only");
      return NextResponse.redirect(redirect);
    }
  }

  // 2. Gating Protected Buyer Routes
  if (needsBuyerAuth && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/account/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  // 3. Gating Auth Pages when already logged in
  if (isBuyerAuth && user) {
    if (userRole === "designer") {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/dashboard";
      return NextResponse.redirect(redirect);
    }
    if (path === "/account/login" || path === "/account/signup") {
      const nextParam = request.nextUrl.searchParams.get("next");
      const next = safeInternalPath(nextParam, "/profile");
      const redirect = request.nextUrl.clone();
      redirect.pathname = next.split("?")[0] || "/profile";
      redirect.search = "";
      return NextResponse.redirect(redirect);
    }
  }

  return supabaseResponse;
}
