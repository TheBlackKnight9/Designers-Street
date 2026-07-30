import { prisma } from "@/server/db";

export class WishlistRepository {
  async listProductIds(userId: string): Promise<string[]> {
    const rows = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productId: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => r.productId);
  }

  async add(userId: string, productId: string): Promise<void> {
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
  }

  async remove(userId: string, productId: string): Promise<void> {
    await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  }

  async mergeIds(userId: string, productIds: string[]): Promise<string[]> {
    const unique = [...new Set(productIds.filter(Boolean))];
    if (unique.length === 0) return this.listProductIds(userId);

    await prisma.$transaction(
      unique.map((productId) =>
        prisma.wishlistItem.upsert({
          where: { userId_productId: { userId, productId } },
          create: { userId, productId },
          update: {},
        })
      )
    );
    return this.listProductIds(userId);
  }
}
