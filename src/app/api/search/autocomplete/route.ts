import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** GET /api/search/autocomplete?q=... - Instant Search Autocomplete Suggestions */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return ok({ products: [], categories: [], designerHouses: [] });
    }

    // Parallel queries for fast response (<150ms)
    const [products, designerHouses, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { tags: { hasSome: [q.toLowerCase()] } },
          ],
        },
        select: { id: true, name: true, category: true, price: true, images: true, designerName: true, listingType: true },
        take: 5,
      }),
      prisma.designerHouse.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { handle: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, handle: true, logo: true, verified: true },
        take: 4,
      }),
      prisma.category.findMany({
        where: {
          OR: [
            { label: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, label: true, slug: true, image: true },
        take: 3,
      }),
    ]);

    return ok({
      products,
      designerHouses,
      categories,
    });
  } catch (error) {
    return fail(error);
  }
}
