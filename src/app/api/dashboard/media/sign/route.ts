import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { MediaService } from "@/server/services/media-service";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/**
 * POST /api/dashboard/media/sign
 * Signed Cloudinary upload params for the authenticated designer (folder by ownerType).
 */
export async function POST(request: Request) {
  try {
    await requireDashboardContext();
    const body = (await request.json().catch(() => ({}))) as {
      ownerType?: "product" | "designer";
      resourceType?: "image" | "video" | "auto";
      folder?: string;
    };

    const params = new MediaService().getSignedUploadParams({
      ownerType: body.ownerType === "designer" ? "designer" : "product",
      resourceType: body.resourceType ?? "auto",
      folder: body.folder,
    });

    return ok(params);
  } catch (error) {
    return fail(error);
  }
}
