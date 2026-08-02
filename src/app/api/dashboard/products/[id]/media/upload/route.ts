import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { DashboardProductService } from "@/server/services/dashboard-product-service";
import { MediaService } from "@/server/services/media-service";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/dashboard/products/:id/media/upload
 * Handles direct file upload from client -> server -> Cloudinary -> Supabase.
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ctx = await requireDashboardContext();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ValidationError("No valid file provided in form data");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const isVideo = file.type.startsWith("video/");

    // 1. Upload directly to Cloudinary using Server SDK & persist to DB
    const mediaService = new MediaService();
    await mediaService.uploadAndPersist({
      buffer,
      mimeType: file.type || "application/octet-stream",
      filename: file.name,
      expectedType: isVideo ? "video" : "image",
      productId: id,
      designerId: ctx.designer.id,
      ownerType: "product",
      uploadedById: ctx.user.id,
    });

    // 2. Sync images array on Product table & return updated product JSON
    const productService = new DashboardProductService();
    await productService.syncProductImages(id);
    const updatedProduct = await productService.get(ctx, id);

    return ok(updatedProduct, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
