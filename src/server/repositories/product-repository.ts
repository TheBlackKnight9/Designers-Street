import { prisma } from "@/server/db";
import { toProduct } from "@/server/utils/mappers";
import { publicProductWhere } from "@/server/services/public-visibility";
import type { Product } from "@/lib/types";
import type { ProductGender, ProductStatus, Prisma } from "@prisma/client";
import type { PublicProductFilters } from "@/server/dto/public";

export type ProductCreateData = {
  id: string;
  designerId: string;
  name: string;
  designerName: string;
  price: number;
  basePrice?: number | null;
  mrp?: number | null;
  bestPrice?: number | null;
  category: string;
  subcategory?: string | null;
  gender: ProductGender;
  images?: string[];
  sizes: string[];
  colors?: string[];
  tags?: string[];
  description: string;
  story?: string | null;
  craftOrigin?: string | null;
  material?: string | null;
  technique?: string | null;
  fit?: string | null;
  occasion?: string | null;
  piecesRemaining?: number | null;
  limitedEdition?: boolean;
  customizable?: boolean;
  deliveryText?: string | null;
  status?: ProductStatus;
  listingType?: any;
  conceptCta?: any;
  estimatedLaunch?: string | null;
  weightGrams?: number | null;
  netQuantity?: string | null;
  manufacturerName?: string | null;
  manufacturerAddress?: string | null;
  countryOfOrigin?: string | null;
  sizeChart?: any;
};

const publicInclude = {
  designer: true,
  mediaAssets: {
    orderBy: [
      { displayOrder: "asc" as const },
      { createdAt: "asc" as const },
    ],
  },
} satisfies Prisma.ProductInclude;

export type PublicProductRow = Prisma.ProductGetPayload<{
  include: typeof publicInclude;
}>;

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`, "utf8").toString(
    "base64url"
  );
}

function decodeCursor(
  cursor: string | null | undefined
): { createdAt: Date; id: string } | null {
  if (!cursor) return null;
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const [iso, id] = raw.split("|");
    if (!iso || !id) return null;
    const createdAt = new Date(iso);
    if (Number.isNaN(createdAt.getTime())) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

function buildFilterWhere(
  filters: PublicProductFilters = {}
): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];

  if (filters.category) {
    and.push({
      OR: [
        { category: { equals: filters.category, mode: "insensitive" } },
        { subcategory: { equals: filters.category, mode: "insensitive" } },
        { tags: { has: filters.category } },
      ],
    });
  }
  if (filters.designer) {
    and.push({
      OR: [
        { designerId: filters.designer },
        {
          designer: {
            handle: { equals: filters.designer, mode: "insensitive" },
          },
        },
      ],
    });
  }
  if (filters.tag) {
    and.push({ tags: { has: filters.tag } });
  }
  if (filters.color) {
    and.push({ colors: { has: filters.color } });
  }
  if (filters.size) {
    and.push({ sizes: { has: filters.size } });
  }
  if (filters.customizable === true) {
    and.push({ customizable: true });
  }
  if (filters.customizable === false) {
    and.push({ customizable: false });
  }
  if (filters.minPrice != null && Number.isFinite(filters.minPrice)) {
    and.push({ price: { gte: Math.round(filters.minPrice) } });
  }
  if (filters.maxPrice != null && Number.isFinite(filters.maxPrice)) {
    and.push({ price: { lte: Math.round(filters.maxPrice) } });
  }

  return publicProductWhere(and.length ? { AND: and } : undefined);
}

export class ProductRepository {
  async findAllPublished(): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: publicProductWhere(),
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? toProduct(row) : null;
  }

  async findRawById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  async findPublicById(id: string): Promise<PublicProductRow | null> {
    return prisma.product.findFirst({
      where: publicProductWhere({ id }),
      include: publicInclude,
    });
  }

  async findPublicPage(options: {
    limit: number;
    cursor?: string | null;
    filters?: PublicProductFilters;
  }): Promise<{ rows: PublicProductRow[]; nextCursor: string | null }> {
    const limit = options.limit;
    const decoded = decodeCursor(options.cursor);
    const where = buildFilterWhere(options.filters);

    const rows = await prisma.product.findMany({
      where: {
        ...where,
        ...(decoded
          ? {
              OR: [
                { createdAt: { lt: decoded.createdAt } },
                {
                  createdAt: decoded.createdAt,
                  id: { lt: decoded.id },
                },
              ],
            }
          : {}),
      },
      include: publicInclude,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last ? encodeCursor(last.createdAt, last.id) : null;

    return { rows: page, nextCursor };
  }

  async findByDesignerId(designerId: string): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: publicProductWhere({ designerId }),
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toProduct);
  }

  async findByDesignerIdAll(
    designerId: string,
    status?: ProductStatus
  ): Promise<(Product & { status: ProductStatus })[]> {
    const rows = await prisma.product.findMany({
      where: {
        designerId,
        ...(status ? { status } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((row) => ({ ...toProduct(row), status: row.status }));
  }

  async findByCategory(category: string): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: publicProductWhere({
        OR: [{ category }, { subcategory: category }],
      }),
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toProduct);
  }

  async create(data: ProductCreateData): Promise<Product> {
    const row = await prisma.product.create({
      data: {
        id: data.id,
        designerId: data.designerId,
        name: data.name,
        designerName: data.designerName,
        price: data.price,
        basePrice: data.basePrice ?? null,
        mrp: data.mrp ?? null,
        bestPrice: data.bestPrice ?? null,
        category: data.category,
        subcategory: data.subcategory ?? null,
        gender: data.gender,
        images: data.images ?? [],
        sizes: data.sizes,
        colors: data.colors ?? [],
        tags: data.tags ?? [],
        description: data.description,
        story: data.story ?? null,
        craftOrigin: data.craftOrigin ?? null,
        material: data.material ?? null,
        technique: data.technique ?? null,
        fit: data.fit ?? null,
        occasion: data.occasion ?? null,
        piecesRemaining: data.piecesRemaining ?? null,
        limitedEdition: data.limitedEdition ?? false,
        customizable: data.customizable ?? false,
        deliveryText: data.deliveryText ?? null,
        status: data.status ?? "draft",
        listingType: data.listingType ?? "COMMERCIAL",
        conceptCta: data.conceptCta ?? "BESPOKE_INQUIRY",
        estimatedLaunch: data.estimatedLaunch ?? null,
        weightGrams: data.weightGrams ?? null,
        netQuantity: data.netQuantity ?? null,
        manufacturerName: data.manufacturerName ?? null,
        manufacturerAddress: data.manufacturerAddress ?? null,
        countryOfOrigin: data.countryOfOrigin ?? "India",
        sizeChart: data.sizeChart ?? null,
      },
    });
    return toProduct(row);
  }

  async update(
    id: string,
    data: Prisma.ProductUpdateInput
  ): Promise<Product> {
    const row = await prisma.product.update({ where: { id }, data });
    return toProduct(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  async countByDesigner(designerId: string) {
    const [draft, published, archived] = await Promise.all([
      prisma.product.count({ where: { designerId, status: "draft" } }),
      prisma.product.count({ where: { designerId, status: "published" } }),
      prisma.product.count({ where: { designerId, status: "archived" } }),
    ]);
    return { draft, published, archived, total: draft + published + archived };
  }
}
