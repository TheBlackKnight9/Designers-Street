import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { PRODUCTS } from "@/lib/mock-data";

export const runtime = "nodejs";

/** GET /api/search - Full-Text Faceted Search API with Catalog Fallback */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQ = (searchParams.get("q") || "").trim();
    const q = rawQ.toLowerCase().replace(/s$/, ""); // Normalize "lehengas" -> "lehenga"
    const listingType = searchParams.get("listingType"); // "COMMERCIAL" | "CONCEPT_ART"
    const category = searchParams.get("category");
    const designerId = searchParams.get("designerId");
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const size = searchParams.get("size");
    const color = searchParams.get("color");
    const sort = searchParams.get("sort") || "newest";

    let dbProducts: any[] = [];

    // Try database search first if DB is reachable
    try {
      const where: any = {};

      if (rawQ) {
        where.OR = [
          { name: { contains: rawQ, mode: "insensitive" } },
          { description: { contains: rawQ, mode: "insensitive" } },
          { category: { contains: rawQ, mode: "insensitive" } },
          { craftOrigin: { contains: rawQ, mode: "insensitive" } },
          { material: { contains: rawQ, mode: "insensitive" } },
          { technique: { contains: rawQ, mode: "insensitive" } },
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

      let orderBy: any = [{ createdAt: "desc" }];
      if (sort === "price_asc") orderBy = [{ price: "asc" }];
      else if (sort === "price_desc") orderBy = [{ price: "desc" }];
      else if (sort === "popular") orderBy = [{ recentPurchaseCount: "desc" }, { createdAt: "desc" }];

      dbProducts = await prisma.product.findMany({
        where,
        orderBy,
        include: {
          designer: { select: { id: true, name: true, handle: true, logo: true, verified: true } },
        },
        take: 60,
      });
    } catch {
      /* fallback to catalog */
    }

    // Always fallback to catalog products if DB returned zero or failed
    let results = dbProducts;
    if (results.length === 0) {
      let filtered = PRODUCTS.map((p) => ({
        ...p,
        listingType: (p as any).listingType || "COMMERCIAL",
        designer: { id: p.designerId, name: p.designerName, handle: p.designerName.toLowerCase().replace(/\s+/g, ""), logo: p.images[0] },
      }));

      if (rawQ) {
        filtered = filtered.filter((p) => {
          const name = p.name.toLowerCase();
          const cat = p.category.toLowerCase();
          const desc = (p.description || "").toLowerCase();
          const dName = (p.designerName || "").toLowerCase();
          const tags = (p.tags || []).map((t) => t.toLowerCase());

          return (
            name.includes(rawQ.toLowerCase()) ||
            name.includes(q) ||
            cat.includes(rawQ.toLowerCase()) ||
            cat.includes(q) ||
            desc.includes(rawQ.toLowerCase()) ||
            dName.includes(rawQ.toLowerCase()) ||
            tags.some((t) => t.includes(q))
          );
        });
      }

      if (listingType && listingType !== "ALL") {
        filtered = filtered.filter((p) => (p as any).listingType === listingType || (listingType === "COMMERCIAL" && !(p as any).listingType));
      }

      if (category) {
        filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }

      if (designerId) {
        filtered = filtered.filter((p) => p.designerId === designerId);
      }

      if (maxPrice !== undefined) {
        filtered = filtered.filter((p) => p.price <= maxPrice);
      }

      if (size) {
        filtered = filtered.filter((p) => p.sizes.includes(size));
      }

      if (color) {
        filtered = filtered.filter((p) => (p.colors || []).some((c) => c.toLowerCase() === color.toLowerCase()));
      }

      if (sort === "price_asc") filtered.sort((a, b) => a.price - b.price);
      else if (sort === "price_desc") filtered.sort((a, b) => b.price - a.price);
      else if (sort === "popular") filtered.sort((a, b) => (b.recentPurchaseCount || 0) - (a.recentPurchaseCount || 0));

      results = filtered;
    }

    return ok({ products: results, total: results.length });
  } catch (error) {
    return fail(error);
  }
}
