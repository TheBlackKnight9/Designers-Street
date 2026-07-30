import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";
import { UnauthorizedError, ValidationError } from "@/server/errors";
import type { SessionUser, UserRole } from "@/server/types";

function requireDb() {
  if (!isDatabaseEnabled()) {
    throw new ValidationError(
      "This feature requires USE_DATABASE=true and a valid DATABASE_URL."
    );
  }
}

export async function ensureBuyerAccount(input: {
  authUserId: string;
  email: string;
  name?: string | null;
}): Promise<SessionUser> {
  requireDb();

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
        role: "buyer",
      },
    });
  } else if (input.name && !user.name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: input.name },
    });
  }

  // Designers keep designer role; they can still shop as authenticated users.
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    avatarUrl: user.avatarUrl,
  };
}

export async function getOptionalAuthUser(): Promise<SessionUser | null> {
  if (!isDatabaseEnabled()) return null;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  const existing = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: existing.role as UserRole,
      avatarUrl: existing.avatarUrl,
    };
  }

  return ensureBuyerAccount({
    authUserId: authUser.id,
    email: authUser.email,
    name:
      (authUser.user_metadata?.full_name as string | undefined) ||
      (authUser.user_metadata?.name as string | undefined) ||
      null,
  });
}

export async function requireAuthUser(): Promise<SessionUser> {
  const user = await getOptionalAuthUser();
  if (!user) throw new UnauthorizedError("Sign in required");
  return user;
}

export async function requireBuyerContext(): Promise<SessionUser> {
  requireDb();
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    throw new UnauthorizedError("Sign in required");
  }

  return ensureBuyerAccount({
    authUserId: authUser.id,
    email: authUser.email,
    name:
      (authUser.user_metadata?.full_name as string | undefined) ||
      (authUser.user_metadata?.name as string | undefined) ||
      null,
  });
}
