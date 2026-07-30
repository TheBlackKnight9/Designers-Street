import { FollowRepository } from "@/server/repositories/follow-repository";
import { NotificationService } from "@/server/services/notification-service";
import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError, ValidationError } from "@/server/errors";

export class FollowService {
  constructor(
    private readonly follows = new FollowRepository(),
    private readonly notifications = new NotificationService()
  ) {}

  private requireDb() {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("Follows require USE_DATABASE=true");
    }
  }

  async toggle(followerUserId: string, designerId: string) {
    this.requireDb();
    const designer = await prisma.designerHouse.findUnique({
      where: { id: designerId },
      select: { id: true, name: true, ownerUserId: true, followersCount: true },
    });
    if (!designer) throw new NotFoundError("Designer not found");

    const existing = await this.follows.find(followerUserId, designerId);
    if (existing) {
      await this.follows.delete(followerUserId, designerId);
      const followersCount = await this.follows.countFollowers(designerId);
      await this.syncFollowersDisplay(designerId, followersCount);
      return { following: false, followersCount };
    }

    await this.follows.create(followerUserId, designerId);
    const followersCount = await this.follows.countFollowers(designerId);
    await this.syncFollowersDisplay(designerId, followersCount);

    if (designer.ownerUserId && designer.ownerUserId !== followerUserId) {
      await this.notifications
        .notifyNewFollower(designer.ownerUserId, followerUserId, designerId)
        .catch(() => undefined);
    }

    return { following: true, followersCount };
  }

  async status(followerUserId: string | null, designerId: string) {
    this.requireDb();
    const followersCount = await this.follows.countFollowers(designerId);
    if (!followerUserId) {
      return { following: false, followersCount };
    }
    const row = await this.follows.find(followerUserId, designerId);
    return { following: Boolean(row), followersCount };
  }

  async followingIds(userId: string) {
    this.requireDb();
    return this.follows.listFollowingDesignerIds(userId);
  }

  private async syncFollowersDisplay(designerId: string, count: number) {
    const label =
      count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(count);
    await prisma.designerHouse.update({
      where: { id: designerId },
      data: { followersCount: label },
    });
  }
}
