import { prisma } from "@/server/db";
import type { SessionUser, UserRole } from "@/server/types";
import type { User } from "@prisma/client";

function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    avatarUrl: user.avatarUrl,
  };
}

export class UserRepository {
  async findRecordById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findById(id: string): Promise<SessionUser | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toSessionUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async create(input: {
    email: string;
    passwordHash?: string | null;
    name?: string | null;
    role?: UserRole;
  }): Promise<SessionUser> {
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash ?? null,
        name: input.name ?? null,
        role: input.role ?? "buyer",
      },
    });
    return toSessionUser(user);
  }

  async createWithId(input: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        id: input.id,
        email: input.email.toLowerCase(),
        name: input.name ?? null,
        role: input.role,
      },
    });
  }

  async updateProfile(
    id: string,
    data: { name?: string | null; avatarUrl?: string | null; role?: UserRole }
  ): Promise<SessionUser> {
    const user = await prisma.user.update({ where: { id }, data });
    return toSessionUser(user);
  }

  async updateRecord(
    id: string,
    data: { name?: string | null; avatarUrl?: string | null; role?: UserRole }
  ): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async countFollowing(userId: string): Promise<number> {
    return prisma.follow.count({ where: { followerUserId: userId } });
  }

  async createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.session.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
  }

  async findSessionByTokenHash(tokenHash: string) {
    return prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async deleteSessionByTokenHash(tokenHash: string) {
    try {
      await prisma.session.delete({ where: { tokenHash } });
    } catch {
      /* ignore missing */
    }
  }
}
