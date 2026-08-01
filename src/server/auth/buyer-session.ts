import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/server/repositories";
import { isDatabaseEnabled } from "@/server/utils/env";
import { UnauthorizedError, ValidationError } from "@/server/errors";
import type { SessionUser, UserRole } from "@/server/types";

const users = new UserRepository();

function toSessionUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
}): SessionUser {
  return { ...user, role: user.role as UserRole };
}

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

  let user = await users.findRecordById(input.authUserId);

  if (!user) {
    const byEmail = await users.findByEmail(input.email);
    if (byEmail && byEmail.id !== input.authUserId) {
      throw new ValidationError(
        "An account with this email already exists with a different auth identity."
      );
    }
    user = await users.createWithId({
      id: input.authUserId,
      email: input.email,
      name: input.name,
      role: "buyer",
    });
  } else if (input.name && !user.name) {
    const updated = await users.updateProfile(user.id, { name: input.name });
    return updated;
  }

  // Designers keep designer role; they can still shop as authenticated users.
  return toSessionUser(user);
}

export async function getOptionalAuthUser(): Promise<SessionUser | null> {
  if (!isDatabaseEnabled()) return null;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  const existing = await users.findRecordById(authUser.id);

  if (existing) {
    return toSessionUser(existing);
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
