import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { DashboardProductService } from "@/server/services/dashboard-product-service";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/dashboard/products/:id/media
 * Register Cloudinary upload against an owned product (after signed client upload).
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ctx = await requireDashboardContext();
    const body = (await request.json()) as Record<string, unknown>;
    const type = body.type;
    if (type !== "image" && type !== "video") {
      throw new ValidationError("type must be image or video");
    }

    const product = await new DashboardProductService().registerOwnedMedia(
      ctx,
      id,
      {
        type,
        cloudinaryPublicId: String(body.cloudinaryPublicId || body.publicId || ""),
        secureUrl: String(body.secureUrl || body.url || ""),
        width: typeof body.width === "number" ? body.width : null,
        height: typeof body.height === "number" ? body.height : null,
        duration: typeof body.duration === "number" ? body.duration : null,
        format: typeof body.format === "string" ? body.format : null,
        bytes: typeof body.bytes === "number" ? body.bytes : null,
        folder: typeof body.folder === "string" ? body.folder : null,
        altText: typeof body.altText === "string" ? body.altText : null,
        thumbnailUrl:
          typeof body.thumbnailUrl === "string" ? body.thumbnailUrl : null,
      }
    );
    return ok(product, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
