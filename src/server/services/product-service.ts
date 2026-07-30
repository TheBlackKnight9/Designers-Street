import { ProductRepository } from "@/server/repositories";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError } from "@/server/errors";
import {
  PRODUCTS,
  getProductById,
  getProductsByDesigner,
  getProductsByCategory,
} from "@/lib/mock-data";
import type { Product } from "@/lib/types";

const repo = new ProductRepository();

export class ProductService {
  async listProducts(): Promise<Product[]> {
    if (!isDatabaseEnabled()) return PRODUCTS;
    return repo.findAllPublished();
  }

  async getProduct(id: string): Promise<Product> {
    if (!isDatabaseEnabled()) {
      const product = getProductById(id);
      if (!product) throw new NotFoundError(`Product ${id} not found`);
      return product;
    }
    const product = await repo.findById(id);
    if (!product) throw new NotFoundError(`Product ${id} not found`);
    return product;
  }

  async listByDesigner(designerId: string): Promise<Product[]> {
    if (!isDatabaseEnabled()) return getProductsByDesigner(designerId);
    return repo.findByDesignerId(designerId);
  }

  async listByCategory(category: string): Promise<Product[]> {
    if (!isDatabaseEnabled()) return getProductsByCategory(category);
    return repo.findByCategory(category);
  }
}
