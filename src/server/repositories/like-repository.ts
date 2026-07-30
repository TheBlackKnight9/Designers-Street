import { prisma } from "@/server/db";

export class LikeRepository {
  async findPostLike(userId: string, postId: string) {
    return prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
  }

  async findProductLike(userId: string, productId: string) {
    return prisma.like.findUnique({
      where: { userId_productId: { userId, productId } },
    });
  }

  async createPostLike(userId: string, postId: string) {
    return prisma.$transaction(async (tx) => {
      const like = await tx.like.create({ data: { userId, postId } });
      const post = await tx.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
        select: { likesCount: true, designerId: true },
      });
      return { like, likesCount: post.likesCount, designerId: post.designerId };
    });
  }

  async deletePostLike(userId: string, postId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.like.delete({
        where: { userId_postId: { userId, postId } },
      });
      const post = await tx.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true },
      });
      return {
        likesCount: Math.max(0, post.likesCount),
      };
    });
  }

  async createProductLike(userId: string, productId: string) {
    return prisma.$transaction(async (tx) => {
      const like = await tx.like.create({ data: { userId, productId } });
      const product = await tx.product.update({
        where: { id: productId },
        data: { likesCount: { increment: 1 } },
        select: { likesCount: true, designerId: true, name: true },
      });
      return {
        like,
        likesCount: product.likesCount,
        designerId: product.designerId,
        productName: product.name,
      };
    });
  }

  async deleteProductLike(userId: string, productId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.like.delete({
        where: { userId_productId: { userId, productId } },
      });
      const product = await tx.product.update({
        where: { id: productId },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true },
      });
      return { likesCount: Math.max(0, product.likesCount) };
    });
  }

  async listLikedPostIds(userId: string, postIds: string[]) {
    if (!postIds.length) return new Set<string>();
    const rows = await prisma.like.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    });
    return new Set(rows.map((r) => r.postId!).filter(Boolean));
  }

  async listLikedProductIds(userId: string, productIds: string[]) {
    if (!productIds.length) return new Set<string>();
    const rows = await prisma.like.findMany({
      where: { userId, productId: { in: productIds } },
      select: { productId: true },
    });
    return new Set(rows.map((r) => r.productId!).filter(Boolean));
  }
}
