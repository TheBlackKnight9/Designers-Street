import { UserRepository } from "@/server/repositories";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError, ValidationError } from "@/server/errors";
import type { SessionUser, UserRole } from "@/server/types";

const repo = new UserRepository();

/**
 * Auth business logic scaffold — no UI / login pages in Phase 1.
 * Persists only when USE_DATABASE=true.
 */
export class UserService {
  async getAccountSummary(user: SessionUser) {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("Account access requires USE_DATABASE=true");
    }
    const followingCount = await repo.countFollowing(user.id);
    return { user, followingCount };
  }

  async updateAccountProfile(
    userId: string,
    input: { name?: string; avatarUrl?: string }
  ): Promise<SessionUser> {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("Account updates require USE_DATABASE=true");
    }
    return repo.updateProfile(userId, input);
  }

  async getById(id: string): Promise<SessionUser> {
    if (!isDatabaseEnabled()) {
      throw new ValidationError(
        "User lookups require USE_DATABASE=true (auth scaffold)"
      );
    }
    const user = await repo.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string) {
    if (!isDatabaseEnabled()) return null;
    return repo.findByEmail(email);
  }

  async registerDraft(input: {
    email: string;
    name?: string;
    role?: UserRole;
    passwordHash?: string;
  }): Promise<SessionUser> {
    if (!isDatabaseEnabled()) {
      throw new ValidationError(
        "Registration requires USE_DATABASE=true (auth scaffold)"
      );
    }
    if (!input.email?.includes("@")) {
      throw new ValidationError("Valid email is required");
    }
    const existing = await repo.findByEmail(input.email);
    if (existing) throw new ValidationError("Email already registered");
    return repo.create({
      email: input.email,
      name: input.name,
      role: input.role ?? "buyer",
      passwordHash: input.passwordHash,
    });
  }

  async createWithId(input: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  }): Promise<SessionUser> {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("User creation requires USE_DATABASE=true");
    }
    const user = await repo.createWithId(input);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      avatarUrl: user.avatarUrl,
    };
  }
}
