import { MediaService } from "@/server/services/media-service";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import type { MediaType } from "@/server/types/media";
import type { MediaOwnerType } from "@prisma/client";

export const runtime = "nodejs";

/**
 * POST /api/media/upload
 *
 * JSON bodies:
 * - { intent: "sign", resourceType?, folder?, ownerType? } → signed Cloudinary upload params
 * - { intent: "register", type, cloudinaryPublicId, secureUrl, ... } → persist metadata
 *
 * multipart/form-data:
 * - file (+ optional productId, postId, designerId, storyId, ownerType, folder, altText, displayOrder)
 */
export async function POST(request: Request) {
  try {
    const service = new MediaService();
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        throw new ValidationError("multipart field `file` is required");
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const media = await service.uploadAndPersist({
        buffer,
        mimeType: file.type || "application/octet-stream",
        filename: file.name,
        expectedType: optionalMediaType(form.get("type")),
        productId: optionalString(form.get("productId")),
        postId: optionalString(form.get("postId")),
        designerId: optionalString(form.get("designerId")),
        storyId: optionalString(form.get("storyId")),
        ownerType: optionalOwnerType(form.get("ownerType")),
        folder: optionalString(form.get("folder")) ?? undefined,
        altText: optionalString(form.get("altText")),
        displayOrder: optionalNumber(form.get("displayOrder")),
      });

      return ok(media, { status: 201 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const intent = String(body.intent || "register");

    if (intent === "sign") {
      const resourceType =
        body.resourceType === "image" ||
        body.resourceType === "video" ||
        body.resourceType === "auto"
          ? body.resourceType
          : "auto";
      const params = service.getSignedUploadParams({
        folder: typeof body.folder === "string" ? body.folder : undefined,
        ownerType: optionalOwnerType(body.ownerType),
        resourceType,
      });
      return ok(params);
    }

    if (intent === "register" || intent === "complete") {
      const type = body.type;
      if (type !== "image" && type !== "video") {
        throw new ValidationError("type must be image or video");
      }

      const media = await service.registerUpload({
        type,
        cloudinaryPublicId: String(body.cloudinaryPublicId || body.publicId || ""),
        secureUrl: String(body.secureUrl || body.url || ""),
        width: optionalNumber(body.width),
        height: optionalNumber(body.height),
        duration: optionalNumber(body.duration),
        format: typeof body.format === "string" ? body.format : null,
        bytes: optionalNumber(body.bytes),
        folder: typeof body.folder === "string" ? body.folder : null,
        altText: typeof body.altText === "string" ? body.altText : null,
        thumbnailUrl:
          typeof body.thumbnailUrl === "string" ? body.thumbnailUrl : null,
        displayOrder: optionalNumber(body.displayOrder),
        productId: typeof body.productId === "string" ? body.productId : null,
        postId: typeof body.postId === "string" ? body.postId : null,
        designerId: typeof body.designerId === "string" ? body.designerId : null,
        storyId: typeof body.storyId === "string" ? body.storyId : null,
        ownerType: optionalOwnerType(body.ownerType),
        uploadedById:
          typeof body.uploadedById === "string" ? body.uploadedById : null,
      });

      return ok(media, { status: 201 });
    }

    throw new ValidationError(
      `Unknown intent "${intent}". Use "sign" or "register".`
    );
  } catch (error) {
    return fail(error);
  }
}

function optionalString(value: FormDataEntryValue | null | unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function optionalNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function optionalMediaType(value: FormDataEntryValue | null): MediaType | undefined {
  if (value === "image" || value === "video") return value;
  return undefined;
}

function optionalOwnerType(value: unknown): MediaOwnerType | undefined {
  if (
    value === "product" ||
    value === "post" ||
    value === "designer" ||
    value === "story" ||
    value === "unattached"
  ) {
    return value;
  }
  return undefined;
}
