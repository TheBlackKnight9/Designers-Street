import { WishlistRepository } from "@/server/repositories/wishlist-repository";
import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError, ValidationError } from "@/server/errors";

export class WishlistService {
  constructor(private readonly wishlists = new WishlistRepository()) {}

  private requireDb() {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("Wishlist requires USE_DATABASE=true");
    }
  }

  async listIds(userId: string): Promise<string[]> {
    this.requireDb();
    return this.wishlists.listProductIds(userId);
  }

  async toggle(userId: string, productId: string): Promise<{ ids: string[]; wished: boolean }> {
    this.requireDb();
    const product = await prisma.product.findFirst({
      where: { id: productId, status: "published" },
      select: { id: true },
    });
    if (!product) throw new NotFoundError("Product not found");

    const ids = await this.wishlists.listProductIds(userId);
    if (ids.includes(productId)) {
      await this.wishlists.remove(userId, productId);
      return { ids: ids.filter((id) => id !== productId), wished: false };
    }
    await this.wishlists.add(userId, productId);
    return { ids: [productId, ...ids], wished: true };
  }

  async merge(userId: string, productIds: string[]): Promise<string[]> {
    this.requireDb();
    // Only merge published products that still exist
    const valid = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "published" },
      select: { id: true },
    });
    return this.wishlists.mergeIds(
      userId,
      valid.map((p) => p.id)
    );
  }
}
