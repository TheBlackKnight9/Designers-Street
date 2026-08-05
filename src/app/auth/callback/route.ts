import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { safeInternalPath } from "@/lib/safe-redirect";

function getPublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Supabase OAuth / magic-link callback — exchanges ?code= for a session cookie.
 * Google sign-in redirects here: /auth/callback?next=/profile
 *
 * Cookie writes are applied via Next cookies() so the session survives the redirect
 * to /account/oauth-complete.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"), "/profile");

  const fail = () => {
    const url = new URL("/account/login", origin);
    url.searchParams.set("error", "oauth_failed");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  };

  if (!code) return fail();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getPublishableKey();
  if (!url || !key) return fail();

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return fail();
  }

  const bridge = new URL("/account/oauth-complete", origin);
  bridge.searchParams.set("next", next);
  return NextResponse.redirect(bridge);
}
