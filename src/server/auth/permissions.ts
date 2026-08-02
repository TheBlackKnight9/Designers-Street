import type { UserRole, SessionUser } from "@/server/types";
import { ForbiddenError, UnauthorizedError } from "@/server/errors";

export const ROLES = {
  BUYER: "buyer",
  ADMIN: "admin",
} as const;

const ROLE_RANK: Record<string, number> = {
  buyer: 1,
  designer: 1, // legacy: treated same as buyer
  admin: 3,
};

export function hasRole(user: SessionUser | null | undefined, role: UserRole): boolean {
  return user?.role === role;
}

export function hasAtLeastRole(
  user: SessionUser | null | undefined,
  role: UserRole
): boolean {
  if (!user) return false;
  return (ROLE_RANK[user.role] ?? 1) >= (ROLE_RANK[role] ?? 1);
}

export function canAccessAdmin(user: SessionUser | null | undefined): boolean {
  return hasRole(user, "admin");
}

/**
 * Dashboard access = admin only.
 * "designer" role is legacy — kept for DB compat but no longer grants dashboard access.
 */
export function canAccessDesignerDashboard(
  user: SessionUser | null | undefined
): boolean {
  return hasRole(user, "admin");
}

export function assertAuthenticated(
  user: SessionUser | null | undefined
): asserts user is SessionUser {
  if (!user) throw new UnauthorizedError();
}

export function assertRole(user: SessionUser | null | undefined, role: UserRole) {
  assertAuthenticated(user);
  if (role === "admin") {
    assertAdmin(user);
    return;
  }
  if (user.role !== role && !hasAtLeastRole(user, role)) {
    throw new ForbiddenError();
  }
}

export function assertAdmin(user: SessionUser | null | undefined) {
  assertAuthenticated(user);
  if (!canAccessAdmin(user)) throw new ForbiddenError("Admin only");
}

/** Legacy alias — now requires admin (no designer self-login). */
export function assertDesigner(user: SessionUser | null | undefined) {
  assertAdmin(user);
}
