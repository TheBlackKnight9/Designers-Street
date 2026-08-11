import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db";

/**
 * Server-side guard: restricts access to /admin/* pages and /api/admin/* routes.
 * Only users with role === "admin" or in ADMIN_EMAILS are allowed through.
 * All others are redirected to /account/login.
 */
export async function requireAdmin(redirectPath = "/account/login") {
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

  if (adminEmails.includes(authUser.email.toLowerCase())) {
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

    if (!user || user.role !== "admin") {
      redirect(`/?error=admin_access_required`);
    }

    return user;
  } catch (err: unknown) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[requireAdmin] Database error checking admin role:", err);
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

  if (adminEmails.includes(authUser.email.toLowerCase())) {
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

    if (!user || user.role !== "admin") {
      throw new Error("FORBIDDEN");
    }

    return user;
  } catch (err: unknown) {
    console.error("[requireAdminApi] Error checking admin:", err);
    throw new Error("FORBIDDEN");
  }
}
