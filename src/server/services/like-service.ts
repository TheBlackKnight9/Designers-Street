import { LikeRepository } from "@/server/repositories/like-repository";
import { NotificationService } from "@/server/services/notification-service";
import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError, ValidationError } from "@/server/errors";

export class LikeService {
  constructor(
    private readonly likes = new LikeRepository(),
    private readonly notifications = new NotificationService()
  ) {}

  private requireDb() {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("Likes require USE_DATABASE=true");
    }
  }

  async togglePost(userId: string, postId: string) {
    this.requireDb();
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { designer: { select: { ownerUserId: true, name: true } } },
    });
    if (!post) throw new NotFoundError("Post not found");

    const existing = await this.likes.findPostLike(userId, postId);
    if (existing) {
      const result = await this.likes.deletePostLike(userId, postId);
      return { liked: false, likesCount: result.likesCount, target: "post" as const };
    }

    const created = await this.likes.createPostLike(userId, postId);
    const ownerId = post.designer?.ownerUserId;
    if (ownerId && ownerId !== userId) {
      await this.notifications.notifyPostLiked(ownerId, userId, postId).catch(() => undefined);
    }
    return { liked: true, likesCount: created.likesCount, target: "post" as const };
  }

  async toggleProduct(userId: string, productId: string) {
    this.requireDb();
    const product = await prisma.product.findFirst({
      where: { id: productId, status: "published" },
      include: { designer: { select: { ownerUserId: true } } },
    });
    if (!product) throw new NotFoundError("Product not found");

    const existing = await this.likes.findProductLike(userId, productId);
    if (existing) {
      const result = await this.likes.deleteProductLike(userId, productId);
      return { liked: false, likesCount: result.likesCount, target: "product" as const };
    }

    const created = await this.likes.createProductLike(userId, productId);
    const ownerId = product.designer?.ownerUserId;
    if (ownerId && ownerId !== userId) {
      await this.notifications
        .notifyProductLiked(ownerId, userId, productId, product.name)
        .catch(() => undefined);
    }
    return { liked: true, likesCount: created.likesCount, target: "product" as const };
  }

  /**
   * Resolve ambiguous feed ids: prefer Post, else Product.
   */
  async toggleTarget(userId: string, targetId: string) {
    this.requireDb();
    const post = await prisma.post.findUnique({ where: { id: targetId } });
    if (post) return this.togglePost(userId, targetId);
    return this.toggleProduct(userId, targetId);
  }
}
