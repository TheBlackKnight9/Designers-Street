import { createClient } from "@/lib/supabase/server";
import { isDatabaseEnabled } from "@/server/utils/env";
import { UnauthorizedError, ForbiddenError } from "@/server/errors";
import { canAccessDesignerDashboard } from "@/server/auth/permissions";
import type { SessionUser, UserRole } from "@/server/types";
import { prisma } from "@/server/db";

export type AdminContext = {
  user: SessionUser;
};

export async function requireAdminContext(): Promise<AdminContext> {
  // In development mode or when DB is disabled, allow dev admin context
  if (process.env.NODE_ENV === "development" || !isDatabaseEnabled()) {
    try {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser?.email) {
        return {
          user: {
            id: authUser.id,
            email: authUser.email,
            name: (authUser.user_metadata?.full_name as string) || "Admin (Dev)",
            role: "admin",
            avatarUrl: null,
          },
        };
      }
    } catch {
      /* ignore */
    }

    return {
      user: {
        id: "admin-dev",
        email: "admin@designersstreet.com",
        name: "Admin",
        role: "admin",
        avatarUrl: null,
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    throw new UnauthorizedError("Sign in required");
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length > 0 && adminEmails.includes(authUser.email.toLowerCase())) {
    return {
      user: {
        id: authUser.id,
        email: authUser.email,
        name: (authUser.user_metadata?.full_name as string) || "Admin",
        role: "admin",
        avatarUrl: null,
      },
    };
  }

  if (authUser.user_metadata?.role === "admin" || authUser.app_metadata?.role === "admin") {
    return {
      user: {
        id: authUser.id,
        email: authUser.email,
        name: (authUser.user_metadata?.full_name as string) || "Admin",
        role: "admin",
        avatarUrl: null,
      },
    };
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!dbUser) {
      throw new UnauthorizedError("User record not found. Please sign in again.");
    }

    const sessionUser: SessionUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      avatarUrl: dbUser.avatarUrl,
    };

    if (!canAccessDesignerDashboard(sessionUser)) {
      throw new ForbiddenError("Admin access required.");
    }

    return { user: sessionUser };
  } catch (err) {
    if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
      throw err;
    }
    console.error("[requireAdminContext] Database error:", err);
    throw new ForbiddenError("Admin verification failed.");
  }
}
