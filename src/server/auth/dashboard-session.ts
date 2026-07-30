import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";
import {
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "@/server/errors";
import { canAccessDesignerDashboard } from "@/server/auth/permissions";
import type { SessionUser, UserRole } from "@/server/types";
import type { DesignerHouse as DbDesigner } from "@prisma/client";

const PLACEHOLDER_LOGO =
  "https://images.unsplash.com/photo-1618220179428-22790b461013?w=200&q=80";
const PLACEHOLDER_BANNER =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80";

export type DashboardContext = {
  user: SessionUser;
  designer: DbDesigner;
};

function slugifyHandle(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "designer";
}

async function uniqueHandle(base: string): Promise<string> {
  let handle = slugifyHandle(base);
  let n = 0;
  while (true) {
    const candidate = n === 0 ? handle : `${handle}-${n}`;
    const existing = await prisma.designerHouse.findFirst({
      where: { handle: { equals: candidate, mode: "insensitive" } },
    });
    if (!existing) return candidate;
    n += 1;
    if (n > 50) return `${handle}-${Date.now().toString(36)}`;
  }
}

/**
 * Ensure Prisma User + DesignerHouse exist for a Supabase Auth user.
 */
export async function ensureDesignerAccount(input: {
  authUserId: string;
  email: string;
  name?: string | null;
  houseName?: string | null;
  handle?: string | null;
  /** Explicit designer onboarding only — never silently promote shoppers. */
  promoteBuyer?: boolean;
}): Promise<DashboardContext> {
  if (!isDatabaseEnabled()) {
    throw new ValidationError(
      "Designer dashboard requires USE_DATABASE=true and a valid DATABASE_URL."
    );
  }

  let user = await prisma.user.findUnique({ where: { id: input.authUserId } });

  if (!user) {
    const byEmail = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (byEmail && byEmail.id !== input.authUserId) {
      throw new ValidationError(
        "An account with this email already exists with a different auth identity."
      );
    }
    user = await prisma.user.create({
      data: {
        id: input.authUserId,
        email: input.email.toLowerCase(),
        name: input.name ?? null,
        role: "designer",
      },
    });
  } else if (user.role === "buyer") {
    if (!input.promoteBuyer) {
      throw new ForbiddenError(
        "This account is registered as a buyer. Use designer signup to open a house, or continue shopping from your account."
      );
    }
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: "designer", name: input.name ?? user.name },
    });
  } else if (input.name && !user.name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: input.name },
    });
  }

  let designer = await prisma.designerHouse.findUnique({
    where: { ownerUserId: user.id },
  });

  if (!designer) {
    const displayName =
      input.houseName?.trim() ||
      input.name?.trim() ||
      input.email.split("@")[0] ||
      "Designer House";
    const handle = await uniqueHandle(input.handle || displayName);
    designer = await prisma.designerHouse.create({
      data: {
        id: `dh_${user.id.replace(/-/g, "").slice(0, 16)}`,
        ownerUserId: user.id,
        name: displayName,
        handle,
        logo: PLACEHOLDER_LOGO,
        banner: PLACEHOLDER_BANNER,
        bio: "New designer on Designer's Street",
        foundingStory: "Profile details coming soon.",
        location: "India",
        signatureTechniques: [],
        accountStatus: "active",
      },
    });
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    avatarUrl: user.avatarUrl,
  };

  if (!canAccessDesignerDashboard(sessionUser)) {
    throw new ForbiddenError("Designer dashboard only");
  }

  return { user: sessionUser, designer };
}

/** Resolve authenticated designer from Supabase cookies (Route Handlers). */
export async function requireDashboardContext(): Promise<DashboardContext> {
  if (!isDatabaseEnabled()) {
    throw new ValidationError(
      "Designer dashboard requires USE_DATABASE=true and a valid DATABASE_URL."
    );
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    throw new UnauthorizedError("Sign in required");
  }

  return ensureDesignerAccount({
    authUserId: authUser.id,
    email: authUser.email,
    name:
      (authUser.user_metadata?.full_name as string | undefined) ||
      (authUser.user_metadata?.name as string | undefined) ||
      null,
  });
}
