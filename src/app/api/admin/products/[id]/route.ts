import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { requireAdminApi } from "@/lib/auth/admin-guard";
import { PRODUCTS, getDesignerById } from "@/lib/mock-data";
import type { ProductStatus, ProductGender } from "@prisma/client";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/admin/products/[id] — Fetch single product detail for editing */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAdminApi();
    const { id } = await params;

    let dbProduct: any = null;
    try {
      dbProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          designer: {
            select: { id: true, name: true, handle: true, logo: true },
          },
          mediaAssets: {
            orderBy: { displayOrder: "asc" },
          },
        },
      });
    } catch (dbErr) {
      console.warn("[/api/admin/products/[id]] DB read warning:", dbErr);
    }

    if (dbProduct) {
      const mediaImages = (dbProduct.mediaAssets || [])
        .filter((m: any) => m.kind === "IMAGE" || !m.kind)
        .map((m: any) => m.url);
      const combinedImages = Array.from(new Set([...(dbProduct.images || []), ...mediaImages]));

      return ok({
        product: {
          id: dbProduct.id,
          name: dbProduct.name,
          designerName: dbProduct.designer?.name || dbProduct.designerName || "Designer House",
          designerId: dbProduct.designerId,
          category: dbProduct.category,
          subcategory: dbProduct.subcategory || "",
          gender: dbProduct.gender || "unisex",
          price: dbProduct.price,
          mrp: dbProduct.mrp ?? null,
          basePrice: dbProduct.basePrice ?? null,
          description: dbProduct.description || "",
          sizes: dbProduct.sizes || [],
          colors: dbProduct.colors || [],
          tags: dbProduct.tags || [],
          piecesRemaining: dbProduct.piecesRemaining ?? 10,
          deliveryText: dbProduct.deliveryText || "",
          customizable: Boolean(dbProduct.customizable),
          limitedEdition: Boolean(dbProduct.limitedEdition),
          status: dbProduct.status || "published",
          listingType: dbProduct.listingType || "COMMERCIAL",
          images: combinedImages,
          craftOrigin: dbProduct.craftOrigin || "",
          material: dbProduct.material || "",
          technique: dbProduct.technique || "",
          story: dbProduct.story || "",
          weightGrams: dbProduct.weightGrams ?? 500,
          countryOfOrigin: dbProduct.countryOfOrigin || "India",
        },
      });
    }

    // Fallback to mock product
    const mockP = PRODUCTS.find((p) => p.id === id);
    if (!mockP) {
      return new Response(
        JSON.stringify({ ok: false, error: { code: "NOT_FOUND", message: `Product ${id} not found` } }),
        { status: 404 }
      );
    }

    const designer = getDesignerById(mockP.designerId);
    return ok({
      product: {
        id: mockP.id,
        name: mockP.name,
        designerName: mockP.designerName || designer?.name || "Designer House",
        designerId: mockP.designerId,
        category: mockP.category,
        subcategory: mockP.subcategory || "",
        gender: mockP.gender || "unisex",
        price: mockP.price,
        mrp: mockP.mrp ?? null,
        basePrice: (mockP as any).basePrice ?? null,
        description: mockP.description || "",
        sizes: mockP.sizes || ["S", "M", "L"],
        colors: mockP.colors || [],
        tags: mockP.tags || [],
        piecesRemaining: mockP.piecesRemaining ?? 10,
        deliveryText: mockP.deliveryText || "Dispatched in 3-5 business days",
        customizable: Boolean(mockP.customizable),
        limitedEdition: Boolean(mockP.limitedEdition),
        status: "published",
        listingType: "COMMERCIAL",
        images: mockP.images || [],
        craftOrigin: mockP.craftOrigin || "",
        material: mockP.material || "",
        technique: mockP.technique || "",
        story: mockP.story || "",
        weightGrams: 500,
        countryOfOrigin: "India",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return new Response(
        JSON.stringify({ ok: false, error: { code: "FORBIDDEN", message: "Admin access required" } }),
        { status: 403 }
      );
    }
    return fail(error);
  }
}

/** PATCH /api/admin/products/[id] — Update product details */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdminApi();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.category !== undefined) updateData.category = String(body.category).trim();
    if (body.subcategory !== undefined) updateData.subcategory = String(body.subcategory).trim() || null;
    if (body.gender !== undefined) updateData.gender = body.gender as ProductGender;
    if (body.price !== undefined) updateData.price = Math.max(0, Math.round(Number(body.price)));
    if (body.mrp !== undefined) updateData.mrp = body.mrp ? Math.max(0, Math.round(Number(body.mrp))) : null;
    if (body.basePrice !== undefined) updateData.basePrice = body.basePrice ? Math.max(0, Math.round(Number(body.basePrice))) : null;
    if (Array.isArray(body.sizes)) updateData.sizes = body.sizes;
    if (Array.isArray(body.colors)) updateData.colors = body.colors;
    if (Array.isArray(body.tags)) updateData.tags = body.tags;
    if (Array.isArray(body.images)) updateData.images = body.images;
    if (body.piecesRemaining !== undefined) {
      updateData.piecesRemaining = body.piecesRemaining === null ? null : Math.max(0, Number(body.piecesRemaining));
    }
    if (body.deliveryText !== undefined) updateData.deliveryText = String(body.deliveryText).trim() || null;
    if (body.customizable !== undefined) updateData.customizable = Boolean(body.customizable);
    if (body.limitedEdition !== undefined) updateData.limitedEdition = Boolean(body.limitedEdition);
    if (body.status !== undefined) updateData.status = body.status as ProductStatus;
    if (body.craftOrigin !== undefined) updateData.craftOrigin = String(body.craftOrigin).trim() || null;
    if (body.material !== undefined) updateData.material = String(body.material).trim() || null;
    if (body.technique !== undefined) updateData.technique = String(body.technique).trim() || null;
    if (body.story !== undefined) updateData.story = String(body.story).trim() || null;
    if (body.weightGrams !== undefined) updateData.weightGrams = body.weightGrams ? Number(body.weightGrams) : null;

    if (body.designerId) {
      updateData.designer = { connect: { id: body.designerId } };
      const house = await prisma.designerHouse.findUnique({ where: { id: body.designerId } });
      if (house) updateData.designerName = house.name;
    }

    try {
      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });
      return ok({ product: updated });
    } catch {
      return ok({ updated: true, id, ...updateData });
    }
  } catch (error) {
    return fail(error);
  }
}

/** DELETE /api/admin/products/[id] — Delete product */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAdminApi();
    const { id } = await params;

    try {
      await prisma.product.delete({ where: { id } });
    } catch {
      /* ignore if not in DB */
    }

    return ok({ deletedId: id });
  } catch (error) {
    return fail(error);
  }
}
