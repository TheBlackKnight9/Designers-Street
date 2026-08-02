import { createClient } from "@/lib/supabase/server";
import { isDatabaseEnabled } from "@/server/utils/env";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/server/errors";
import { canAccessDesignerDashboard } from "@/server/auth/permissions";
import type { SessionUser, UserRole } from "@/server/types";
import { prisma } from "@/server/db";

export type AdminContext = {
  user: SessionUser;
};

export async function requireAdminContext(): Promise<AdminContext> {
  if (!isDatabaseEnabled()) {
    throw new ValidationError("Admin functions require database connection.");
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    throw new UnauthorizedError("Sign in required");
  }

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
}
