import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { PRODUCTS, DESIGNERS, CATEGORIES } from "@/lib/mock-data";

export const runtime = "nodejs";

/** GET /api/search/autocomplete?q=... - Instant Search Autocomplete Suggestions */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQ = (searchParams.get("q") || "").trim();
    const q = rawQ.toLowerCase().replace(/s$/, "");

    if (!rawQ || rawQ.length < 2) {
      return ok({ products: [], categories: [], designerHouses: [] });
    }

    let products: any[] = [];
    let designerHouses: any[] = [];
    let categories: any[] = [];

    try {
      const [dbProducts, dbDesigners, dbCategories] = await Promise.all([
        prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: rawQ, mode: "insensitive" } },
              { category: { contains: rawQ, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, category: true, price: true, images: true, designerName: true, listingType: true },
          take: 5,
        }),
        prisma.designerHouse.findMany({
          where: {
            OR: [
              { name: { contains: rawQ, mode: "insensitive" } },
              { handle: { contains: rawQ, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, handle: true, logo: true, verified: true },
          take: 4,
        }),
        prisma.category.findMany({
          where: {
            OR: [
              { label: { contains: rawQ, mode: "insensitive" } },
              { slug: { contains: rawQ, mode: "insensitive" } },
            ],
          },
          select: { id: true, label: true, slug: true, image: true },
          take: 3,
        }),
      ]);
      products = dbProducts;
      designerHouses = dbDesigners;
      categories = dbCategories;
    } catch {
      /* fallback */
    }

    if (products.length === 0) {
      products = PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(rawQ.toLowerCase()) ||
          p.category.toLowerCase().includes(rawQ.toLowerCase()) ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          images: p.images,
          designerName: p.designerName,
          listingType: (p as any).listingType || "COMMERCIAL",
        }));
    }

    if (designerHouses.length === 0) {
      designerHouses = DESIGNERS.filter(
        (d) =>
          d.name.toLowerCase().includes(rawQ.toLowerCase()) ||
          d.handle.toLowerCase().includes(rawQ.toLowerCase())
      )
        .slice(0, 4)
        .map((d) => ({
          id: d.id,
          name: d.name,
          handle: d.handle,
          logo: d.logo,
          verified: d.verified,
        }));
    }

    if (categories.length === 0) {
      categories = CATEGORIES.filter(
        (c) =>
          c.label.toLowerCase().includes(rawQ.toLowerCase()) ||
          c.slug.toLowerCase().includes(rawQ.toLowerCase())
      )
        .slice(0, 3)
        .map((c) => ({
          id: c.slug,
          label: c.label,
          slug: c.slug,
          image: c.image,
        }));
    }

    return ok({
      products,
      designerHouses,
      categories,
    });
  } catch (error) {
    return fail(error);
  }
}
