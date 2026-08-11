import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDatabaseEnabled } from "@/server/utils/env";
import { prisma } from "@/server/db";

/**
 * Server-side guard: restricts access to /admin/* pages and /api/admin/* routes.
 * 1. In development mode or demo mode, allows access for local testing.
 * 2. In production, allows users in ADMIN_EMAILS, user_metadata.role === 'admin', or DB role === 'admin'.
 */
export async function requireAdmin(redirectPath = "/account/login") {
  // In development without strict auth or when DB is disabled, allow access for effortless development
  if (process.env.NODE_ENV === "development" || !isDatabaseEnabled()) {
    try {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser?.email) {
        return {
          id: authUser.id,
          email: authUser.email,
          name: (authUser.user_metadata?.full_name as string) || "Admin (Dev)",
          role: "admin",
        };
      }
    } catch {
      /* ignore */
    }

    return {
      id: "admin-dev",
      email: "admin@designersstreet.com",
      name: "Admin",
      role: "admin",
    };
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    redirect(`${redirectPath}?next=/admin`);
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // If email is in configured ADMIN_EMAILS list, allow
  if (adminEmails.length > 0 && adminEmails.includes(authUser.email.toLowerCase())) {
    return {
      id: authUser.id,
      email: authUser.email,
      name: (authUser.user_metadata?.full_name as string) || "Admin",
      role: "admin",
    };
  }

  // If user metadata explicitly sets role === 'admin'
  if (authUser.user_metadata?.role === "admin" || authUser.app_metadata?.role === "admin") {
    return {
      id: authUser.id,
      email: authUser.email,
      name: (authUser.user_metadata?.full_name as string) || "Admin",
      role: "admin",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (user && user.role === "admin") {
      return user;
    }

    redirect(`/?error=admin_access_required`);
  } catch (err: unknown) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[requireAdmin] Database error checking admin role:", err);
    // If ADMIN_EMAILS is not configured yet and DB had an error, allow authenticated users gracefully if they logged in with admin intent
    if (authUser.user_metadata?.role === "admin") {
      return {
        id: authUser.id,
        email: authUser.email,
        name: (authUser.user_metadata?.full_name as string) || "Admin",
        role: "admin",
      };
    }
    redirect(`/?error=admin_access_required`);
  }
}

/**
 * API-route version: returns 403 JSON instead of redirecting.
 * Use this inside Route Handlers (/api/admin/*).
 */
export async function requireAdminApi(): Promise<{
  id: string;
  email: string;
  role: string;
  name: string | null;
}> {
  if (process.env.NODE_ENV === "development" || !isDatabaseEnabled()) {
    try {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser?.email) {
        return {
          id: authUser.id,
          email: authUser.email,
          name: (authUser.user_metadata?.full_name as string) || "Admin (Dev)",
          role: "admin",
        };
      }
    } catch {
      /* ignore */
    }

    return {
      id: "admin-dev",
      email: "admin@designersstreet.com",
      name: "Admin",
      role: "admin",
    };
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    throw new Error("UNAUTHORIZED");
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length > 0 && adminEmails.includes(authUser.email.toLowerCase())) {
    return {
      id: authUser.id,
      email: authUser.email,
      name: (authUser.user_metadata?.full_name as string) || "Admin",
      role: "admin",
    };
  }

  if (authUser.user_metadata?.role === "admin" || authUser.app_metadata?.role === "admin") {
    return {
      id: authUser.id,
      email: authUser.email,
      name: (authUser.user_metadata?.full_name as string) || "Admin",
      role: "admin",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (user && user.role === "admin") {
      return user;
    }

    throw new Error("FORBIDDEN");
  } catch (err: unknown) {
    console.error("[requireAdminApi] Error checking admin:", err);
    throw new Error("FORBIDDEN");
  }
}
