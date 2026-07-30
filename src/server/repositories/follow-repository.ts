import { prisma } from "@/server/db";

export class FollowRepository {
  async find(followerUserId: string, designerId: string) {
    return prisma.follow.findUnique({
      where: {
        followerUserId_designerId: { followerUserId, designerId },
      },
    });
  }

  async create(followerUserId: string, designerId: string) {
    return prisma.follow.create({
      data: { followerUserId, designerId },
    });
  }

  async delete(followerUserId: string, designerId: string) {
    await prisma.follow.delete({
      where: {
        followerUserId_designerId: { followerUserId, designerId },
      },
    });
  }

  async countFollowers(designerId: string) {
    return prisma.follow.count({ where: { designerId } });
  }

  async countFollowing(followerUserId: string) {
    return prisma.follow.count({ where: { followerUserId } });
  }

  async listFollowingDesignerIds(followerUserId: string) {
    const rows = await prisma.follow.findMany({
      where: { followerUserId },
      select: { designerId: true },
    });
    return rows.map((r) => r.designerId);
  }

  async listFollowedAmong(followerUserId: string, designerIds: string[]) {
    if (!designerIds.length) return new Set<string>();
    const rows = await prisma.follow.findMany({
      where: { followerUserId, designerId: { in: designerIds } },
      select: { designerId: true },
    });
    return new Set(rows.map((r) => r.designerId));
  }
}
