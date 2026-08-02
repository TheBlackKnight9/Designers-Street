import { createClient } from "@/lib/supabase/server";
import { DesignerRepository } from "@/server/repositories";
import { isDatabaseEnabled } from "@/server/utils/env";
import {
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "@/server/errors";
import { canAccessDesignerDashboard } from "@/server/auth/permissions";
import type { SessionUser, UserRole } from "@/server/types";
import type { DesignerHouse as DbDesigner } from "@prisma/client";
import { prisma } from "@/server/db";

const designers = new DesignerRepository();

const PLACEHOLDER_LOGO =
  "https://images.unsplash.com/photo-1618220179428-22790b461013?w=200&q=80";
const PLACEHOLDER_BANNER =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80";

export type DashboardContext = {
  user: SessionUser;
  designer: DbDesigner;
};

/**
 * Resolve authenticated ADMIN from Supabase cookies.
 * Admins must select an active house via the cookie `admin_active_designer_id`.
 * If no house is selected the first available house is used.
 *
 * This is used by ALL /api/dashboard/* routes (products, posts, media, stories, etc.)
 * It does NOT throw if media/product calls have a valid admin + active house.
 */
export async function requireDashboardContext(): Promise<DashboardContext> {
  if (!isDatabaseEnabled()) {
    throw new ValidationError(
      "Dashboard requires USE_DATABASE=true and a valid DATABASE_URL."
    );
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    throw new UnauthorizedError("Sign in required");
  }

  // Resolve Prisma user
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

  // Only admins can access the dashboard
  if (!canAccessDesignerDashboard(sessionUser)) {
    throw new ForbiddenError(
      "Admin access required. The designer self-service portal is disabled."
    );
  }

  // Resolve active house from cookie
  let activeDesigner: DbDesigner | null = null;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const adminActiveHouseId = cookieStore.get("admin_active_designer_id")?.value;

    if (adminActiveHouseId) {
      activeDesigner = await designers.findRecordById(adminActiveHouseId);
    }
  } catch {
    /* cookie access may fail in some contexts — fall through */
  }

  // Fallback: use the first available designer house
  if (!activeDesigner) {
    const allHouses = await prisma.designerHouse.findMany({
      where: { accountStatus: "active" },
      orderBy: { createdAt: "asc" },
      take: 1,
    });
    activeDesigner = allHouses[0] ?? null;
  }

  if (!activeDesigner) {
    throw new ValidationError(
      "No designer house found. Create a house first from /admin/designers before managing products."
    );
  }

  return { user: sessionUser, designer: activeDesigner };
}
