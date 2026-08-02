import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db";

/**
 * Server-side guard: restricts access to /admin/* pages and /api/admin/* routes.
 * Only users with role === "admin" are allowed through.
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

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  // Only role === "admin" is allowed — designer and buyer are rejected
  if (!user || user.role !== "admin") {
    redirect(`/?error=admin_access_required`);
  }

  return user;
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

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user || user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return user;
}
