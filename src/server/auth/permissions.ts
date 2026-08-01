import type { UserRole, SessionUser } from "@/server/types";
import { ForbiddenError, UnauthorizedError } from "@/server/errors";

export const ROLES = {
  BUYER: "buyer",
  DESIGNER: "designer",
  ADMIN: "admin",
} as const satisfies Record<string, UserRole>;

const ROLE_RANK: Record<UserRole, number> = {
  buyer: 1,
  designer: 2,
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
  return ROLE_RANK[user.role] >= ROLE_RANK[role];
}

export function canAccessAdmin(user: SessionUser | null | undefined): boolean {
  return hasRole(user, "admin");
}

export function canAccessDesignerDashboard(
  user: SessionUser | null | undefined
): boolean {
  return hasRole(user, "designer") || hasRole(user, "admin");
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
  if (role === "designer") {
    assertDesigner(user);
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

export function assertDesigner(user: SessionUser | null | undefined) {
  assertAuthenticated(user);
  if (!canAccessDesignerDashboard(user)) {
    throw new ForbiddenError("Designer dashboard only");
  }
}
