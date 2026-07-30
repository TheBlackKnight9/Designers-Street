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
}
