import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

/** GET /api/dashboard/inventory - Fetch designer's inventory matrix & metrics */
export async function GET() {
  try {
    const ctx = await requireDashboardContext();

    const products = await prisma.product.findMany({
      where: { designerId: ctx.designer.id },
      include: {
        variants: {
          orderBy: { size: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalProducts = products.length;
    let totalStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let conceptCount = 0;

    const items = products.map((p) => {
      const isConcept = (p as any).listingType === "CONCEPT_ART";
      if (isConcept) conceptCount++;

      const stock = p.piecesRemaining ?? p.variants.reduce((acc, v) => acc + v.stock, 0);
      totalStockCount += stock;

      if (!isConcept) {
        if (stock === 0) outOfStockCount++;
        else if (stock < 5) lowStockCount++;
      }

      return {
        ...p,
        totalStock: stock,
        isConcept,
      };
    });

    return ok({
      metrics: {
        totalProducts,
        totalStockCount,
        lowStockCount,
        outOfStockCount,
        conceptCount,
      },
      products: items,
      designerHandle: ctx.designer.handle,
    });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/dashboard/inventory - Upsert variant SKU inventory */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "dashboard:inventory");
    const ctx = await requireDashboardContext();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const productId = String(body.productId || "").trim();
    const variantsInput = Array.isArray(body.variants) ? body.variants : [];

    if (!productId) throw new ValidationError("Product ID is required");

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.designerId !== ctx.designer.id) {
      throw new ValidationError("Product not found or access denied");
    }

    const updatedVariants = [];
    let aggregateStock = 0;

    for (const v of variantsInput) {
      const size = String(v.size || "Free Size").trim();
      const color = v.color ? String(v.color).trim() : null;
      const stock = Math.max(0, Number(v.stock || 0));
      aggregateStock += stock;

      const sanitizedHandle = ctx.designer.handle.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const sanitizedProdId = productId.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      const sanitizedSize = size.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const sanitizedColor = color ? color.toUpperCase().replace(/[^A-Z0-9]/g, "") : "STD";

      const generatedSku = `DS-${sanitizedHandle}-${sanitizedProdId}-${sanitizedSize}-${sanitizedColor}`;
      const sku = v.sku ? String(v.sku).trim() : generatedSku;

      const variant = await prisma.productVariant.upsert({
        where: {
          productId_size_color: {
            productId,
            size,
            color: color || "",
          },
        },
        create: {
          productId,
          size,
          color: color || "",
          sku,
          stock,
          isActive: stock > 0,
        },
        update: {
          sku,
          stock,
          isActive: stock > 0,
        },
      });
      updatedVariants.push(variant);
    }

    // Synchronize aggregate product piecesRemaining
    await prisma.product.update({
      where: { id: productId },
      data: {
        piecesRemaining: aggregateStock,
      },
    });

    return ok({ variants: updatedVariants, aggregateStock });
  } catch (error) {
    return fail(error);
  }
}
