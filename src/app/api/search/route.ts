import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** GET /api/search - Full-Text Faceted Search API */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const listingType = searchParams.get("listingType"); // "COMMERCIAL" | "CONCEPT_ART"
    const category = searchParams.get("category");
    const designerId = searchParams.get("designerId");
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const size = searchParams.get("size");
    const color = searchParams.get("color");
    const sort = searchParams.get("sort") || "newest";

    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { craftOrigin: { contains: q, mode: "insensitive" } },
        { material: { contains: q, mode: "insensitive" } },
        { technique: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q.toLowerCase()] } },
      ];
    }

    if (listingType && (listingType === "COMMERCIAL" || listingType === "CONCEPT_ART")) {
      where.listingType = listingType;
    }

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (designerId) {
      where.designerId = designerId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (size) {
      where.sizes = { has: size };
    }

    if (color) {
      where.colors = { hasSome: [color.toLowerCase()] };
    }

    let orderBy: any = [{ createdAt: "desc" }];
    if (sort === "price_asc") orderBy = [{ price: "asc" }];
    else if (sort === "price_desc") orderBy = [{ price: "desc" }];
    else if (sort === "popular") orderBy = [{ recentPurchaseCount: "desc" }, { createdAt: "desc" }];

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        designer: { select: { id: true, name: true, handle: true, logo: true, verified: true } },
      },
      take: 60,
    });

    return ok({ products, total: products.length });
  } catch (error) {
    return fail(error);
  }
}
