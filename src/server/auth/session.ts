import { createHash, randomBytes } from "crypto";
import type { SessionUser } from "@/server/types";
import { UserRepository } from "@/server/repositories";
import { isDatabaseEnabled } from "@/server/utils/env";

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "ds_session";

function sessionMaxAgeMs(): number {
  const days = Number(process.env.SESSION_MAX_AGE_DAYS || "14");
  return days * 24 * 60 * 60 * 1000;
}

export function getAuthSecret(): string {
  return process.env.AUTH_SECRET || "dev-only-insecure-secret";
}

/** Opaque session token (store only hash in DB). */
export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256")
    .update(`${getAuthSecret()}:${token}`)
    .digest("hex");
}

/**
 * Auth service scaffold — session create/resolve/destroy.
 * Phase 2 will wire cookies + login UI; Phase 1 only provides utilities.
 */
export class AuthService {
  private users = new UserRepository();

  async createSession(userId: string): Promise<{
    token: string;
    expiresAt: Date;
  }> {
    if (!isDatabaseEnabled()) {
      const expiresAt = new Date(Date.now() + sessionMaxAgeMs());
      return { token: createSessionToken(), expiresAt };
    }
    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + sessionMaxAgeMs());
    await this.users.createSession({
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    });
    return { token, expiresAt };
  }

  async resolveSession(token: string | undefined | null): Promise<SessionUser | null> {
    if (!token || !isDatabaseEnabled()) return null;
    const session = await this.users.findSessionByTokenHash(
      hashSessionToken(token)
    );
    if (!session) return null;
    if (session.expiresAt.getTime() < Date.now()) {
      await this.users.deleteSessionByTokenHash(session.tokenHash);
      return null;
    }
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      avatarUrl: session.user.avatarUrl,
    };
  }

  async destroySession(token: string | undefined | null): Promise<void> {
    if (!token || !isDatabaseEnabled()) return;
    await this.users.deleteSessionByTokenHash(hashSessionToken(token));
  }
}
