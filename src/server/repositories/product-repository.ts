import { prisma } from "@/server/db";
import { toProduct } from "@/server/utils/mappers";
import type { Product } from "@/lib/types";

export class ProductRepository {
  async findAllPublished(): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? toProduct(row) : null;
  }

  async findByDesignerId(designerId: string): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: { designerId, status: "published" },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toProduct);
  }

  async findByCategory(category: string): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: {
        status: "published",
        OR: [{ category }, { subcategory: category }],
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toProduct);
  }
}
